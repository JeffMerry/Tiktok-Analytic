import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db';
import {fetchAndSaveChannel, initialBackfillChannelVideos} from './services/tiktokApi';
import analyticsRouter from './routes/analytics';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/analytics', analyticsRouter);

app.get('/health', async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'OK',db_time: result.rows[0].now });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

app.get('/api/track/:username', async (req: Request, res: Response) => {
    try {
        const username = req.params.username as string;
        const data = await fetchAndSaveChannel(username);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/backfill/:username', async (req: Request, res: Response) => {
    try {
        const username = req.params.username as string;

        const channelRes = await db.query<{ id: number }>('SELECT id FROM channels WHERE username = $1', [username]);
    
        if (channelRes.rows.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'กรุณาเรียก /api/track/:username ก่อน เพื่อสร้างช่องในระบบ' });
        }
        const channelId = channelRes.rows[0].id;

        // เริ่มรัน Backfill แบบยิงวนลูปจนหมดช่อง
        const result = await initialBackfillChannelVideos(channelId, username);

        res.json({
            status: 'Success',
            message: `Backfill ข้อมูลย้อนหลังของ @${username} เรียบร้อยแล้ว`,
            totalVideosFetched: result.totalFetched,
            isCompleted: result.isCompleted
        });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// Endpoint สำหรับ Cron-Job (Lightweight response ป้องกัน Output Too Large)
app.get('/api/cron/daily-sync/:username?', async (req: Request, res: Response) => {
    try {
        const targetUser = (req.params.username as string) || (req.query.username as string) || 'jjayallday';
        console.log(`⏰ [Cron-Job] เริ่ม Sync ข้อมูลประจำวันสำหรับ @${targetUser}...`);
        
        await fetchAndSaveChannel(targetUser);
        
        // ส่ง Response ขนาดกะทัดรัด (< 100 bytes) ป้องกัน Cron-Job.org Error
        res.status(200).json({
            ok: true,
            user: targetUser,
            syncedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('❌ [Cron-Job] เกิดข้อผิดพลาด:', error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 TypeScript Server listening on http://localhost:${PORT}`);
});