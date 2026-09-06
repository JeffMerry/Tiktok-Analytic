import axios from 'axios';
import db from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

export interface TikTokUserInfo {
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  followers: number;
  likes: number;
  videoCount: number;
}

// สร้าง Axios Client รวมศูนย์พร้อม Timeout ป้องกัน Request ค้าง
const tiktokApi = axios.create({
  baseURL: `https://${process.env.RAPIDAPI_HOST}`,
  timeout: 15000, // 15 วินาที
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY as string,
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST as string
  }
});

// 1. ฟังก์ชันดึงข้อมูลโปรไฟล์ + สถิติช่อง
export async function fetchAndSaveChannel(username: string): Promise<TikTokUserInfo> {
  try {
    console.log(`⏳ [TikWM] กำลังดึงข้อมูลช่อง @${username}...`);
    const response = await tiktokApi.get('/user/info', {
      params: { unique_id: username }
    });
    
    // โครงสร้าง Response ของ TikWM
    const rawData = response.data.data;
    if (!rawData) {
      throw new Error(response.data.msg || 'ไม่พบข้อมูลช่องนี้');
    }

    const userInfo: TikTokUserInfo = {
      username: rawData.user.uniqueId || rawData.user.unique_id || username,
      displayName: rawData.user.nickname || username,
      avatarUrl: rawData.user.avatarMedium || rawData.user.avatar || '',
      isVerified: rawData.user.verified || false,
      followers: rawData.stats.followerCount || rawData.stats.followers || 0,
      likes: rawData.stats.heartCount || rawData.stats.heart || rawData.stats.likes || 0,
      videoCount: rawData.stats.videoCount || rawData.stats.video_count || 0
    };

    // 1. Save/Update ลงตาราง channels
    const channelQuery = `
      INSERT INTO channels (username, display_name, avatar_url, is_verified)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) 
      DO UPDATE SET 
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        is_verified = EXCLUDED.is_verified
      RETURNING id;
    `;
    const channelRes = await db.query<{ id: number }>(channelQuery, [
      userInfo.username,
      userInfo.displayName,
      userInfo.avatarUrl,
      userInfo.isVerified
    ]);

    const channelId = channelRes.rows[0].id;
    const today = new Date().toISOString().split('T')[0];

    // 2. Save สถิติรายวันลงตาราง channel_daily_stats
    const statsQuery = `
      INSERT INTO channel_daily_stats (channel_id, followers, total_likes, video_count, record_date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (channel_id, record_date)
      DO UPDATE SET
        followers = EXCLUDED.followers,
        total_likes = EXCLUDED.total_likes,
        video_count = EXCLUDED.video_count;
    `;
    await db.query(statsQuery, [
      channelId,
      userInfo.followers,
      userInfo.likes,
      userInfo.videoCount,
      today
    ]);

    console.log(`✅ [TikWM] บันทึกสถิติช่อง @${username} ลง Supabase สำเร็จ!`);
    
    // ดึงวิดีโอ 30 คลิปล่าสุดต่อ (ใช้ 1 Request เท่าเดิม)
    await fetchAndSaveUserVideos(channelId, userInfo.username);

    return userInfo;

  } catch (error: any) {
    if (error.response) {
      console.error('❌ TikWM Error Status:', error.response.status);
      console.error('❌ TikWM Response Data:', error.response.data);
    } else {
      console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูลช่อง:', error.message);
    }
    throw error;
  }
}

// 2. ฟังก์ชันดึงวิดีโอย้อนหลัง 30 คลิปล่าสุด (1 Request)
export async function fetchAndSaveUserVideos(channelId: number, username: string): Promise<void> {
  try {
    console.log(`⏳ [TikWM] กำลังดึง 30 วิดีโอล่าสุดของ @${username}...`);
    const response = await tiktokApi.get('/user/posts', {
      params: { 
        unique_id: username, 
        count: 30, // ดึง 30 คลิปใน 1 Request ฟรี
        cursor: 0,
        sort_type: 0
      }
    });
    
    const videosList = response.data.data?.videos || response.data.videos || [];

    for (const vid of videosList) {
      const videoId = String(vid.video_id || vid.id || '');
      if (!videoId) continue;

      const coverUrl = vid.cover || vid.origin_cover || vid.dynamic_cover || vid.cover_url || '';
      const views: number = Number(vid.play_count || vid.views || 0);
      const likes: number = Number(vid.digg_count || vid.likes || 0);
      const comments: number = Number(vid.comment_count || vid.comments || 0);
      const shares: number = Number(vid.share_count || vid.shares || 0);
      const favorites: number = Number(vid.collect_count || vid.favorites || 0);
      const duration: number = Number(vid.duration || 0);
      const createTime: number = Number(vid.create_time || Math.floor(Date.now() / 1000));

      // 1. บันทึก Metadata ลงตาราง videos
      const videoQuery = `
        INSERT INTO videos (
          channel_id, video_id, caption, cover_url, duration, posted_at
        )
        VALUES ($1, $2, $3, $4, $5, to_timestamp($6::double precision))
        ON CONFLICT (video_id) 
        DO UPDATE SET
          caption = EXCLUDED.caption,
          cover_url = EXCLUDED.cover_url,
          duration = EXCLUDED.duration
        RETURNING id;
      `;

      const videoRes = await db.query<{ id: number }>(videoQuery, [
        channelId,
        videoId,
        vid.title || vid.desc || '',
        coverUrl,
        duration,
        createTime
      ]);

      const insertedVideoDbId = videoRes.rows[0].id;

      // 2. บันทึกสถิติตัวเลขลงตาราง video_stats
      const statsQuery = `
        INSERT INTO video_stats (
          video_id, views, likes, comments, shares, favorites
        )
        VALUES ($1, $2, $3, $4, $5, $6);
      `;

      await db.query(statsQuery, [
        insertedVideoDbId,
        views,
        likes,
        comments,
        shares,
        favorites
      ]);
    }

    console.log(`✅ [TikWM] บันทึกวิดีโอ ${videosList.length} คลิปลง Supabase สำเร็จ!`);

  } catch (error: any) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงวิดีโอ:', error.message);
  }
}

// 3. Backfill ดึงคลิปย้อนหลังทั้งหมดของช่อง
export async function initialBackfillChannelVideos(
  channelId: number, 
  username: string
): Promise<{ totalFetched: number; isCompleted: boolean }> {
  let cursor: string | number = 0;
  let hasMore = true;
  let totalFetched = 0;
  const BATCH_SIZE = 30;

  console.log(`🚀 [Backfill] เริ่มดึงข้อมูลคลิปย้อนหลังของ @${username}...`);

  while (hasMore) {
    try {
      console.log(`⏳ [Backfill] กำลังดึงชุดคลิปที่ Cursor: ${cursor}...`);
      const apiRes = await tiktokApi.get('/user/posts', {
        params: { 
          unique_id: username, 
          count: BATCH_SIZE,
          cursor: cursor,
          sort_type: 0
        }
      });

      const resData = apiRes.data.data || apiRes.data;
      const videosList = resData?.videos || [];

      if (videosList.length === 0) {
        console.log(`ℹ️ [Backfill] ไม่พบวิดีโอเพิ่มเติมแล้ว`);
        break;
      }

      // บันทึกลง Supabase
      for (const vid of videosList) {
        const videoId = String(vid.video_id || vid.id || '');
        if (!videoId) continue; // ข้ามถ้าไม่มี Video ID

        const coverUrl = vid.cover || vid.origin_cover || vid.dynamic_cover || vid.cover_url || '';
        const views = Number(vid.play_count || vid.views || 0);
        const likes = Number(vid.digg_count || vid.likes || 0);
        const comments = Number(vid.comment_count || vid.comments || 0);
        const shares = Number(vid.share_count || vid.shares || 0);
        const favorites = Number(vid.collect_count || vid.favorites || 0);
        const duration = Number(vid.duration || 0);
        const createTime = Number(vid.create_time || Math.floor(Date.now() / 1000));

        // 1. บันทึก Metadata ลง videos
        const videoQuery = `
          INSERT INTO videos (
            channel_id, video_id, caption, cover_url, duration, posted_at
          )
          VALUES ($1, $2, $3, $4, $5, to_timestamp($6::double precision))
          ON CONFLICT (video_id) 
          DO UPDATE SET
            caption = EXCLUDED.caption,
            cover_url = EXCLUDED.cover_url,
            duration = EXCLUDED.duration
          RETURNING id;
        `;

        const videoRes = await db.query<{ id: number }>(videoQuery, [
          channelId,
          videoId,
          vid.title || vid.desc || '',
          coverUrl,
          duration,
          createTime
        ]);

        const insertedVideoDbId = videoRes.rows[0].id;

        // 2. บันทึกสถิติตัวเลขลง video_stats
        const statsQuery = `
          INSERT INTO video_stats (
            video_id, views, likes, comments, shares, favorites
          )
          VALUES ($1, $2, $3, $4, $5, $6);
        `;

        await db.query(statsQuery, [
          insertedVideoDbId,
          views,
          likes,
          comments,
          shares,
          favorites
        ]);
      }

      totalFetched += videosList.length;
      console.log(`📦 [Backfill Progress] บันทึกแล้ว ${totalFetched} คลิป...`);

      // ตรวจสอบ Cursor สำหรับรอบถัดไป
      hasMore = Boolean(resData.hasMore || resData.has_more);
      cursor = resData.cursor || resData.next_cursor || 0;

      if (!cursor || cursor === 0 || cursor === '0') break;

      // พัก 1.5 วินาที คั่นระหว่างรอบเพื่อป้องกัน Rate Limit
      await new Promise((resolve) => setTimeout(resolve, 1500));

    } catch (error: any) {
      console.error(`❌ [Backfill Error] ขัดข้องที่ Cursor ${cursor}:`, error.message);
      if (error.response) {
        console.error('❌ API Details:', error.response.data);
      }
      return { totalFetched, isCompleted: false };
    }
  }

  console.log(`🎉 [Backfill Complete] ดึงและบันทึกคลิปสำเร็จทั้งหมด ${totalFetched} คลิปลง Supabase!`);
  return { totalFetched, isCompleted: true };
}