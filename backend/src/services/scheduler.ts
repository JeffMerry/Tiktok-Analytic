import cron from 'node-cron';
import db from '../config/db';
import { fetchAndSaveChannel } from './tiktokApi';

/**
 * ฟังก์ชันเริ่มต้นการทำงานของ Cron Job อัปเดตข้อมูล TikTok รายวันอัตโนมัติ
 */
export function startCronJobs(): void {
  console.log('⏰ [Scheduler] เริ่มต้นการทำงานของ Cron Job Service...');

  // ตั้งเวลา: รันวันละ 1 ครั้ง ทุกเที่ยงคืน (00:00 น.)
  const cronSchedule = '0 0 * * *';

  cron.schedule(cronSchedule, async () => {
    console.log('⏰ [Cron Job] ถึงเวลาอัปเดตข้อมูลช่อง TikTok ประจำวัน...');
    try {
      // 1. ดึงรายชื่อทุกช่องที่มีในฐานข้อมูล
      const channelsRes = await db.query<{ username: string }>('SELECT username FROM channels');
      
      if (channelsRes.rows.length === 0) {
        console.log('ℹ️ [Cron Job] ยังไม่มีช่องที่ต้องติดตามในระบบ');
        return;
      }

      // 2. ทยอยอัปเดตทีละช่อง
      for (const channel of channelsRes.rows) {
        console.log(`⏳ [Cron Job] กำลังอัปเดตข้อมูลช่อง @${channel.username}...`);
        await fetchAndSaveChannel(channel.username);
        // พัก 2 วินาทีระหว่างช่องเพื่อป้องกัน Rate Limit
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      console.log('✅ [Cron Job] อัปเดตข้อมูลทุกช่องลง Database ประจำวันเรียบร้อยแล้ว!');
    } catch (error: any) {
      console.error('❌ [Cron Job Error] เกิดข้อผิดพลาดในการรัน Cron Job:', error.message);
    }
  });

  console.log(`📡 [Scheduler] ลงทะเบียน Cron Job (${cronSchedule}) ประจำวันเรียบร้อยแล้ว`);
}
