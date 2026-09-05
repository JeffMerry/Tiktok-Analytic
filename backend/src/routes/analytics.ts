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
                SELECT v.tiktok_video_id, c.username
                FROM videos v
                JOIN channels c ON c.id = v.channel_id
                WHERE v.cover_url = $1
                LIMIT 1;
            `;
            const videoRes = await db.query(videoQuery, [imageUrl]);
            if (videoRes.rows.length > 0) {
                const { tiktok_video_id, username } = videoRes.rows[0];
                const tikwmRes = await axios.get(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@${username}/video/${tiktok_video_id}`);
                const freshCover = tikwmRes.data?.data?.cover || tikwmRes.data?.data?.origin_cover;
                if (freshCover) {
                    await db.query('UPDATE videos SET cover_url = $1 WHERE tiktok_video_id = $2', [freshCover, tiktok_video_id]);
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
router.get('/channel/:username', async (req:Request , res: Response) => {
    try{
        const { username } = req.params;

        const channelQuery = `
            SELECT
                c.id, c.username, c.display_name, c.avatar_url, c.is_verified,
                ds.followers_count, ds.likes_count, ds.video_count, ds.record_date
            FROM channels c
            LEFT JOIN daily_stats ds ON c.id = ds.channel_id
            WHERE c.username = $1
            ORDER BY ds.record_date DESC
            LIMIT 1;
        `;
        const channelRes = await db.query(channelQuery, [username]);
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบข้อมูลช่องนี้ในระบบ'})
        }
        const channel = channelRes.rows[0];

        const statsQuery = `
            SELECT
                COUNT(id) as total_videos_in_db,
                COALESCE(SUM(views_count), 0) as total_views,
                COALESCE(SUM(Likes_count), 0) as total_likes,
                COALESCE(SUM(comments_count), 0) as total_comments,
                COALESCE(SUM(shares_count), 0) as total_shares,
                COALESCE(ROUND(AVG(views_count), 0), 0) as avg_views,
                COALESCE(ROUND(AVG(engagement_rate::numeric), 2), 0) as avg_engagement_rate
            FROM videos
            WHERE channel_id = $1;
        `;

        const statsRes = await db.query(statsQuery, [channel.id]);
        const videoStats = statsRes.rows[0];

        // Top Performing Video
        const topVideoQuery = `
            SELECT tiktok_video_id, caption, cover_url, views_count, likes_count, engagement_rate, posted_at
            FROM videos
            WHERE channel_id = $1
            ORDER BY views_count DESC
            LIMIT 1;
        `;
        const topVideoRes = await db.query(topVideoQuery, [channel.id]);

        res.json({
            status: 'Success',
            data: {
                profile: {
                    id: channel.id,
                    username: channel.username,
                    displayName: channel.display_name,
                    avatarUrl: channel.avatar_url,
                    isVerified: channel.is_verified,
                    followers: Number(channel.followers_count || 0),
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
                },
                topVideo: topVideoRes.rows[0] || null
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

//Filter, Search เเละ Pagination GET /api/analytics/videos/:username
router.get('/videos/:username', async (req:Request , res:Response) => {
    try {
         const { username } = req.params;
         const limit = parseInt(req.query.limit as string) || 20;
         const page = parseInt(req.query.page as string) || 1;
         const offset = (page - 1 ) * limit;

         //Sorting Column
         const allowedSortBy = ['views_count', 'likes_count' , 'comments_count', 'shares_count' , 'engagement_rate', 'posted_at'];
         const sortByParam = req.query.sortBy as string;
         const sortBy = allowedSortBy.includes(sortByParam) ? sortByParam : 'posted_at';
         const order = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
         const search = req.query.search ? `%${req.query.search}%` : null;

         const channelRes = await db.query<{ id: number}>('SELECT id FROM channels WHERE username = $1', [username]);
         if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบช่องในระบบนี้'});
         }
         const channelId = channelRes.rows[0].id;

         let videosQuery = `
            SELECT 
                tiktok_video_id, caption, cover_url, duration, 
                views_count, likes_count, comments_count, shares_count, 
                engagement_rate, posted_at
            FROM videos
            WHERE channel_id = $1
         `;
         const queryParams: any[] = [channelId];

         if (search) {
            queryParams.push(search);
            videosQuery += ` AND caption ILIKE $${queryParams.length}`;
         }

         videosQuery +=` ORDER BY ${sortBy} ${order} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
         queryParams.push(limit, offset);

         const videosRes = await db.query(videosQuery,queryParams);

         let countQuery = `SELECT COUNT (id) FROM videos WHERE channel_id = $1`;
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
        res.status(500).json({ status: 'Error', message: error.message});
    }
});

// Line Chart GET /api/analytics/trends/:username
router.get('/trends/:username', async (req: Request , res:Response) => {
    try {
        const { username } = req.params;

        const query = `
            SELECT ds.followers_count, ds.likes_count, ds.video_count, ds.record_date
            FROM daily_stats ds
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


// GET /api/analytics/best-time/:username
router.get('/best-time/:username', async (req: Request, res: Response) => {
    try{
        const { username } = req.params;
        // ID for search Tiktok
        const channelRes = await db.query<{ id: number}>(`SELECT id FROM channels WHERE username = $1`,[username]);
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'ไม่พบช่องนี้ในระบบ'});
        }
        const channelId = channelRes.rows[0].id;

        //Query ดึงสถิติตามวันในสัปดาห์ (0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์)
        const dayQuery = `
            SELECT
                EXTRACT(DOW FROM posted_at) as day_index,
                COUNT(id) as video_count,
                COALESCE(ROUND(AVG(views_count),0),0) as avg_views,
                COALESCE(ROUND(AVG(likes_count),0),0) as avg_likes,
                COALESCE(ROUND(AVG(engagement_rate::numeric),2),0) as avg_engagement
            FROM videos
            WHERE channel_id = $1
            GROUP BY day_index
            ORDER BY day_index ASC;
        `;
        const dayRes = await db.query(dayQuery, [channelId]);

        // Query ดึงสถิติตามชั่วโมงในวัน 
        const hourQuery = `
            SELECT
                EXTRACT(HOUR FROM posted_at) as hour_index,
                COUNT(id) as video_count,
                COALESCE(ROUND(AVG(views_count),0),0) as avg_views,
                COALESCE(ROUND(AVG(likes_count), 0),0) as avg_likes,
                COALESCE(ROUND(AVG(engagement_rate::numeric), 2), 0) as avg_engagement
            FROM videos
            WHERE channel_id = $1
            GROUP BY hour_index
            ORDER BY hour_index ASC;
        `;
        const hourRes = await db.query(hourQuery, [channelId]);

        // ชื่อในสัปดาห์
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const dayNamesTH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

        // Map วัน(0-6) ให้ครบทุกวัน เเม้บางวันไม่มีคลิป
        const byDay = dayNames.map((name,idx) => {
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

        // Map ชั่วโมง(0-23) ให้ครบทุกชั่วโมง
        const byHour = Array.from({ length: 24}, (_, h) => {
            const found = hourRes.rows.find((r: any) => Number(r.hour_index) === h);
            return {
                hour: h,
                label: `${h.toString().padStart(2,'0')}:00`,
                videoCount: Number(found?.video_count || 0),
                avgViews: Number(found?.avg_views || 0),
                avgLikes: Number(found?.avg_likes || 0),
                avgEngagement: Number(found?.avg_engagement || 0),
            };
        });

        //คำนวณหาวันเเละเวลาที่มียอดวิวเฉลี่ยสูงสุดเพื่อสร้างคำเเนะนำ 
        const bestDay = [...byDay].sort((a,b) => b.avgViews - a.avgViews)[0];
        const bestHour = [...byHour].sort((a,b) => b.avgViews - a.avgViews)[0];

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
    } catch (error: any){
        res.status(500).json({ status: 'Error', message: error.message});
    }
});

export default router;



