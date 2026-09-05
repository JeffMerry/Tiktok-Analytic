import cron from 'node-cron';
import { fetchAndSaveChannel } from './tiktokApi';

/**
 * ฟังก์ชันเริ่มต้นการทำงานของ Cron Job ดึงข้อมูลสดจาก TikTok เข้าสู่ Database อัตโนมัติ
 */
export function startCronJobs(): void {
  console.log('⏰ [Scheduler] เริ่มต้นการทำงานของ Cron Job Service...');

  // รูปแบบ Cron Expression: '0 */6 * * *' = ทำงานทุกๆ 6 ชั่วโมง (00:00, 06:00, 12:00, 18:00 น.)
  const cronSchedule = '0 */6 * * *';

  cron.schedule(cronSchedule, async () => {
    console.log('⏰ [Cron Job] ถึงเวลาอัปเดตข้อมูลช่อง @jjayallday อัตโนมัติจาก TikTok...');
    try {
      await fetchAndSaveChannel('jjayallday');
      console.log('✅ [Cron Job] อัปเดตข้อมูลช่อง @jjayallday ลง Database เรียบร้อยแล้ว!');
    } catch (error: any) {
      console.error('❌ [Cron Job Error] เกิดข้อผิดพลาดในการอัปเดตข้อมูลอัตโนมัติ:', error.message);
    }
  });

  console.log(`📡 [Scheduler] ลงทะเบียน Cron Job (${cronSchedule}) สำหรับช่อง @jjayallday เรียบร้อยแล้ว`);
}
