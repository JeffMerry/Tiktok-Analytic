import { Router, Request, Response } from 'express';
import db from '../config/db';
import axios from 'axios';

const router = Router();

// Proxy Image GET /api/analytics/proxy-image?url=...
router.get('/proxy-image', async (req: Request, res: Response) => {
    try {
        const imageUrl = req.query.url as string;
        if (!imageUrl) {
            return res.status(400).send('Missing url parameter');
        }

        try {
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://www.tiktok.com/'
                }
            });

            const contentType = response.headers['content-type'] || 'image/jpeg';
            res.setHeader('Content-Type', String(contentType));
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return response.data.pipe(res);
        } catch (fetchErr: any) {
            // URL Expired or Blocked (403/404) -> Auto-heal from DB and TikWM API
            console.log(`⏳ [Proxy Image] Expired image URL detected, auto-refreshing via TikWM...`);

            // 1. Check if it is a video cover URL
            const videoQuery = `
                SELECT v.video_id, c.username
                FROM videos v
                JOIN channels c ON c.id = v.channel_id
                WHERE v.cover_url = $1
                LIMIT 1;
            `;
            const videoRes = await db.query(videoQuery, [imageUrl]);
            if (videoRes.rows.length > 0) {
                const { video_id, username } = videoRes.rows[0];
                const tikwmRes = await axios.get(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@${username}/video/${video_id}`);
                const freshCover = tikwmRes.data?.data?.cover || tikwmRes.data?.data?.origin_cover;
                if (freshCover) {
                    await db.query('UPDATE videos SET cover_url = $1 WHERE video_id = $2', [freshCover, video_id]);
                    const freshStream = await axios.get(freshCover, {
                        responseType: 'stream',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                            'Referer': 'https://www.tiktok.com/'
                        }
                    });
                    res.setHeader('Content-Type', String(freshStream.headers['content-type'] || 'image/jpeg'));
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    return freshStream.data.pipe(res);
                }
            }

            // 2. Check if it is a channel avatar URL
            const channelQuery = `SELECT username FROM channels WHERE avatar_url = $1 LIMIT 1;`;
            const channelRes = await db.query(channelQuery, [imageUrl]);
            if (channelRes.rows.length > 0) {
                const { username } = channelRes.rows[0];
                const tikwmRes = await axios.get(`https://www.tikwm.com/api/user/info?unique_id=${username}`);
                const freshAvatar = tikwmRes.data?.data?.user?.avatarMedium || tikwmRes.data?.data?.user?.avatar;
                if (freshAvatar) {
                    await db.query('UPDATE channels SET avatar_url = $1 WHERE username = $2', [freshAvatar, username]);
                    const freshStream = await axios.get(freshAvatar, {
                        responseType: 'stream',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                            'Referer': 'https://www.tiktok.com/'
                        }
                    });
                    res.setHeader('Content-Type', String(freshStream.headers['content-type'] || 'image/jpeg'));
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    return freshStream.data.pipe(res);
                }
            }

            return res.status(404).send('Image fetch failed');
        }
    } catch (error: any) {
        return res.status(500).send('Proxy error');
    }
});

// Get Overview Statistics GET /api/analytics/channel/:username
router.get('/channel/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        const channelQuery = `
            SELECT
                c.id, c.username, c.display_name, c.avatar_url, c.is_verified,
                ds.followers, ds.total_likes as likes_count, ds.video_count, ds.record_date
            FROM channels c
            LEFT JOIN channel_daily_stats ds ON c.id = ds.channel_id
            WHERE c.username = $1
            ORDER BY ds.record_date DESC
            LIMIT 1;
        `;
        const channelRes = await db.query(channelQuery, [username]);
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบข้อมูลช่องนี้ในระบบ' });
        }
        const channel = channelRes.rows[0];

        const statsQuery = `
            SELECT
                COUNT(v.id) as total_videos_in_db,
                COALESCE(SUM(vs.views), 0) as total_views,
                COALESCE(SUM(vs.likes), 0) as total_likes,
                COALESCE(SUM(vs.comments), 0) as total_comments,
                COALESCE(SUM(vs.shares), 0) as total_shares,
                COALESCE(ROUND(AVG(vs.views), 0), 0) as avg_views,
                COALESCE(ROUND(
                    AVG(
                        CASE WHEN vs.views > 0 
                        THEN (((vs.likes + vs.comments + vs.shares)::numeric / vs.views) * 100)
                        ELSE 0 END
                    ), 2
                ), 0) as avg_engagement_rate
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views, likes, comments, shares, favorites
                FROM video_stats
                WHERE video_id = v.id
                ORDER BY fetched_at DESC
                LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1;
        `;

        const statsRes = await db.query(statsQuery, [channel.id]);
        const videoStats = statsRes.rows[0];

        // Top Performing Video
        const topVideoQuery = `
            SELECT 
                v.video_id as tiktok_video_id, 
                v.caption, 
                v.cover_url, 
                COALESCE(vs.views, 0) as views_count, 
                COALESCE(vs.likes, 0) as likes_count, 
                COALESCE(ROUND(
                    CASE WHEN vs.views > 0 
                    THEN (((vs.likes + vs.comments + vs.shares)::numeric / vs.views) * 100)
                    ELSE 0 END, 2
                ), 0) as engagement_rate, 
                v.posted_at
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views, likes, comments, shares, favorites
                FROM video_stats
                WHERE video_id = v.id
                ORDER BY fetched_at DESC
                LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1
            ORDER BY vs.views DESC NULLS LAST
            LIMIT 1;
        `;
        const topVideoRes = await db.query(topVideoQuery, [channel.id]);

        // Historical daily stats for followers & total likes
        const dailyHistoryRes = await db.query(
            `SELECT followers, total_likes, video_count, record_date
             FROM channel_daily_stats
             WHERE channel_id = $1
             ORDER BY record_date ASC;`,
            [channel.id]
        );
        const dailyHistory = dailyHistoryRes.rows;

        let followersChange = 0;
        let likesChange = 0;
        let comparisonText = 'First day tracked';

        if (dailyHistory.length >= 2) {
            const latest = dailyHistory[dailyHistory.length - 1];
            const prev = dailyHistory[dailyHistory.length - 2];
            
            if (Number(prev.followers) > 0) {
                followersChange = Number((((Number(latest.followers) - Number(prev.followers)) / Number(prev.followers)) * 100).toFixed(2));
            }
            if (Number(prev.total_likes) > 0) {
                likesChange = Number((((Number(latest.total_likes) - Number(prev.total_likes)) / Number(prev.total_likes)) * 100).toFixed(2));
            }
            const prevDate = new Date(prev.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            comparisonText = `vs ${prevDate}`;
        } else if (dailyHistory.length === 1) {
            comparisonText = 'First day tracked';
        }

        const followersSparkline = dailyHistory.map(r => Number(r.followers));
        const likesSparkline = dailyHistory.map(r => Number(r.total_likes));

        // Recent videos trend for views & engagement sparklines
        const recentVideosRes = await db.query(
            `SELECT 
                COALESCE(vs.views, 0) as views,
                COALESCE(ROUND(
                    CASE WHEN vs.views > 0 
                    THEN (((vs.likes + vs.comments + vs.shares)::numeric / vs.views) * 100)
                    ELSE 0 END, 2
                ), 0) as er
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views, likes, comments, shares
                FROM video_stats
                WHERE video_id = v.id
                ORDER BY fetched_at DESC
                LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1
            ORDER BY v.posted_at ASC NULLS LAST
            LIMIT 20;`,
            [channel.id]
        );

        const viewsSparkline = recentVideosRes.rows.map(r => Number(r.views));
        const engagementSparkline = recentVideosRes.rows.map(r => Number(r.er));

        let viewsChange = 0;
        let engagementChange = 0;
        if (viewsSparkline.length >= 2) {
            const lastView = viewsSparkline[viewsSparkline.length - 1];
            const avgPrevViews = viewsSparkline.slice(0, -1).reduce((a, b) => a + b, 0) / (viewsSparkline.length - 1);
            if (avgPrevViews > 0) {
                viewsChange = Number((((lastView - avgPrevViews) / avgPrevViews) * 100).toFixed(2));
            }
            
            const lastEr = engagementSparkline[engagementSparkline.length - 1];
            const avgPrevEr = engagementSparkline.slice(0, -1).reduce((a, b) => a + b, 0) / (engagementSparkline.length - 1);
            if (avgPrevEr > 0) {
                engagementChange = Number((((lastEr - avgPrevEr) / avgPrevEr) * 100).toFixed(2));
            }
        }

        res.json({
            status: 'Success',
            data: {
                profile: {
                    id: channel.id,
                    username: channel.username,
                    displayName: channel.display_name,
                    avatarUrl: channel.avatar_url,
                    isVerified: channel.is_verified,
                    followers: Number(channel.followers || 0),
                    likes: Number(channel.likes_count || 0),
                    videoCount: Number(channel.video_count || 0),
                },
                metrics: {
                    totalVideosTracked: Number(videoStats.total_videos_in_db),
                    totalViews: Number(videoStats.total_views),
                    totalLikes: Number(videoStats.total_likes),
                    totalComments: Number(videoStats.total_comments),
                    totalShares: Number(videoStats.total_shares),
                    avgViewsPerVideo: Number(videoStats.avg_views),
                    avgEngagementRate: Number(videoStats.avg_engagement_rate),
                    followersChange,
                    viewsChange,
                    likesChange,
                    engagementChange,
                    comparisonText,
                    followersSparkline,
                    likesSparkline,
                    viewsSparkline,
                    engagementSparkline,
                },
                topVideo: topVideoRes.rows[0] || null
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// Filter, Search และ Pagination GET /api/analytics/videos/:username
router.get('/videos/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * limit;

        // Sorting Column Mapping
        const sortByParam = req.query.sortBy as string;
        const sortColumnMap: Record<string, string> = {
            views_count: 'vs.views',
            likes_count: 'vs.likes',
            comments_count: 'vs.comments',
            shares_count: 'vs.shares',
            posted_at: 'v.posted_at'
        };
        const sortBy = sortColumnMap[sortByParam] || 'v.posted_at';
        const order = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const search = req.query.search ? `%${req.query.search}%` : null;

        const channelRes = await db.query<{ id: number }>('SELECT id FROM channels WHERE username = $1', [username]);
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบช่องในระบบนี้' });
        }
        const channelId = channelRes.rows[0].id;

        let videosQuery = `
            SELECT 
                v.video_id as tiktok_video_id, 
                v.caption, 
                v.cover_url, 
                v.duration, 
                COALESCE(vs.views, 0) as views_count, 
                COALESCE(vs.likes, 0) as likes_count, 
                COALESCE(vs.comments, 0) as comments_count, 
                COALESCE(vs.shares, 0) as shares_count, 
                COALESCE(vs.favorites, 0) as favorites_count,
                COALESCE(ROUND(
                    CASE WHEN vs.views > 0 
                    THEN (((vs.likes + vs.comments + vs.shares)::numeric / vs.views) * 100)
                    ELSE 0 END, 2
                ), 0) as engagement_rate, 
                v.posted_at
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views, likes, comments, shares, favorites
                FROM video_stats
                WHERE video_id = v.id
                ORDER BY fetched_at DESC
                LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1
        `;
        const queryParams: any[] = [channelId];

        if (search) {
            queryParams.push(search);
            videosQuery += ` AND v.caption ILIKE $${queryParams.length}`;
        }

        videosQuery += ` ORDER BY ${sortBy} ${order} NULLS LAST LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const videosRes = await db.query(videosQuery, queryParams);

        let countQuery = `SELECT COUNT(id) FROM videos WHERE channel_id = $1`;
        const countParams: any[] = [channelId];
        if (search) {
            countParams.push(search);
            countQuery += ` AND caption ILIKE $2`;
        }
        const countRes = await db.query(countQuery, countParams);
        const totalVideos = parseInt(countRes.rows[0].count);

        res.json({
            status: 'Success',
            pagination: {
                total: totalVideos,
                page,
                limit,
                totalPages: Math.ceil(totalVideos / limit)
            },
            data: videosRes.rows
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// Line Chart GET /api/analytics/trends/:username
router.get('/trends/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        const query = `
            SELECT ds.followers as followers_count, ds.total_likes as likes_count, ds.video_count, ds.record_date
            FROM channel_daily_stats ds
            JOIN channels c ON c.id = ds.channel_id
            WHERE c.username = $1
            ORDER BY ds.record_date ASC;
        `;
        const result = await db.query(query, [username]);

        res.json({
            status: 'Success',
            data: result.rows
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// Best Time to Post GET /api/analytics/best-time/:username
router.get('/best-time/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        const channelRes = await db.query<{ id: number }>('SELECT id FROM channels WHERE username = $1', [username]);
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบช่องนี้ในระบบ' });
        }
        const channelId = channelRes.rows[0].id;

        // 1. ดึงสถิติตามวันในสัปดาห์ (0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์)
        const dayQuery = `
            SELECT 
                EXTRACT(DOW FROM v.posted_at) as day_index,
                COUNT(v.id) as video_count,
                COALESCE(ROUND(AVG(vs.views), 0), 0) as avg_views,
                COALESCE(ROUND(AVG(vs.likes), 0), 0) as avg_likes,
                COALESCE(ROUND(
                    AVG(
                        CASE WHEN vs.views > 0 
                        THEN (((vs.likes + vs.comments + vs.shares)::numeric / vs.views) * 100)
                        ELSE 0 END
                    ), 2
                ), 0) as avg_engagement
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views, likes, comments, shares, favorites
                FROM video_stats
                WHERE video_id = v.id
                ORDER BY fetched_at DESC
                LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1
            GROUP BY day_index
            ORDER BY day_index ASC;
        `;
        const dayRes = await db.query(dayQuery, [channelId]);

        // 2. ดึงสถิติตามชั่วโมงในวัน (0 - 23 น.)
        const hourQuery = `
            SELECT 
                EXTRACT(HOUR FROM v.posted_at) as hour_index,
                COUNT(v.id) as video_count,
                COALESCE(ROUND(AVG(vs.views), 0), 0) as avg_views,
                COALESCE(ROUND(AVG(vs.likes), 0), 0) as avg_likes,
                COALESCE(ROUND(
                    AVG(
                        CASE WHEN vs.views > 0 
                        THEN (((vs.likes + vs.comments + vs.shares)::numeric / vs.views) * 100)
                        ELSE 0 END
                    ), 2
                ), 0) as avg_engagement
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views, likes, comments, shares, favorites
                FROM video_stats
                WHERE video_id = v.id
                ORDER BY fetched_at DESC
                LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1
            GROUP BY hour_index
            ORDER BY hour_index ASC;
        `;
        const hourRes = await db.query(hourQuery, [channelId]);

        // ชื่อวันในสัปดาห์
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayNamesTH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

        // Map วัน (0-6) ให้ครบทุกวัน แม้บางวันไม่มีคลิป
        const byDay = dayNames.map((name, idx) => {
            const found = dayRes.rows.find((r: any) => Number(r.day_index) === idx);
            return {
                dayIndex: idx,
                dayName: name,
                dayNameTH: dayNamesTH[idx],
                videoCount: Number(found?.video_count || 0),
                avgViews: Number(found?.avg_views || 0),
                avgLikes: Number(found?.avg_likes || 0),
                avgEngagement: Number(found?.avg_engagement || 0),
            };
        });

        // Map ชั่วโมง (0-23 น.) ให้ครบทั้ง 24 ชั่วโมง
        const byHour = Array.from({ length: 24 }, (_, h) => {
            const found = hourRes.rows.find((r: any) => Number(r.hour_index) === h);
            return {
                hour: h,
                label: `${h.toString().padStart(2, '0')}:00`,
                videoCount: Number(found?.video_count || 0),
                avgViews: Number(found?.avg_views || 0),
                avgLikes: Number(found?.avg_likes || 0),
                avgEngagement: Number(found?.avg_engagement || 0),
            };
        });

        // คำนวณหาวันและชั่วโมงที่มียอดวิวเฉลี่ยสูงสุด
        const bestDay = [...byDay].sort((a, b) => b.avgViews - a.avgViews)[0];
        const bestHour = [...byHour].sort((a, b) => b.avgViews - a.avgViews)[0];

        res.json({
            status: 'Success',
            data: {
                recommendation: {
                    bestDay: bestDay?.dayNameTH || 'วันศุกร์',
                    bestHour: bestHour?.label || '18:00',
                    avgViews: bestDay?.avgViews || 0,
                    avgEngagement: bestDay?.avgEngagement || 0,
                },
                byDay,
                byHour
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// 5. Channel Growth History (30 Days) GET /api/analytics/growth/:username
router.get('/growth/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const days = parseInt(req.query.days as string) || 30;

        const channelRes = await db.query<{ id: number }>('SELECT id FROM channels WHERE username = $1', [username]);
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบช่องในระบบนี้' });
        }
        const channelId = channelRes.rows[0].id;

        // Current total views across all videos
        const viewsRes = await db.query(`
            SELECT COALESCE(SUM(vs.views), 0) as total_views
            FROM videos v
            LEFT JOIN LATERAL (
                SELECT views FROM video_stats WHERE video_id = v.id ORDER BY fetched_at DESC LIMIT 1
            ) vs ON true
            WHERE v.channel_id = $1;
        `, [channelId]);
        const currentTotalViews = Number(viewsRes.rows[0]?.total_views || 0);

        // Fetch daily stats ordered by date ascending
        const historyRes = await db.query(`
            SELECT 
                record_date,
                followers,
                total_likes,
                video_count
            FROM channel_daily_stats
            WHERE channel_id = $1
            ORDER BY record_date ASC
            LIMIT $2;
        `, [channelId, days]);

        const thaiMonths = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];

        const chartData = historyRes.rows.map((row: any) => {
            const dateObj = new Date(row.record_date);
            const dayNum = dateObj.getDate();
            const monthText = thaiMonths[dateObj.getMonth()];
            const yearBE = dateObj.getFullYear() + 543;

            return {
                date: row.record_date,
                label: `${dayNum} ${monthText}`,
                fullLabel: `${dayNum} ${monthText} ${yearBE}`,
                followers: Number(row.followers || 0),
                likes: Number(row.total_likes || 0),
                videoCount: Number(row.video_count || 0),
                views: currentTotalViews,
            };
        });

        // Summary calculations
        let followersDiff = 0;
        let followersPct = 0;
        let likesDiff = 0;
        let likesPct = 0;
        let videoDiff = 0;
        let videoPct = 0;
        let viewsDiff = 0;
        let viewsPct = 0;

        if (chartData.length >= 2) {
            const first = chartData[0];
            const last = chartData[chartData.length - 1];

            followersDiff = last.followers - first.followers;
            followersPct = first.followers > 0 ? Number(((followersDiff / first.followers) * 100).toFixed(1)) : 0;

            likesDiff = last.likes - first.likes;
            likesPct = first.likes > 0 ? Number(((likesDiff / first.likes) * 100).toFixed(1)) : 0;

            videoDiff = last.videoCount - first.videoCount;
            videoPct = first.videoCount > 0 ? Number(((videoDiff / first.videoCount) * 100).toFixed(1)) : 0;

            viewsDiff = last.views - first.views;
            viewsPct = first.views > 0 ? Number(((viewsDiff / first.views) * 100).toFixed(1)) : 0;
        }

        const latestRecord = chartData[chartData.length - 1] || {
            followers: 0,
            likes: 0,
            videoCount: 0,
            views: currentTotalViews,
        };

        res.json({
            status: 'Success',
            data: {
                days,
                chartData,
                summary: {
                    periodText: `สรุปการเติบโต ${days} วัน`,
                    followers: {
                        current: latestRecord.followers,
                        diff: followersDiff,
                        percent: followersPct
                    },
                    views: {
                        current: latestRecord.views,
                        diff: viewsDiff,
                        percent: viewsPct
                    },
                    likes: {
                        current: latestRecord.likes,
                        diff: likesDiff,
                        percent: likesPct
                    },
                    videoCount: {
                        current: latestRecord.videoCount,
                        diff: videoDiff,
                        percent: videoPct
                    }
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

export default router;
