import fs from 'fs';
import path from 'path';
import db from './config/db';

async function runMigration() {
    try {
        console.log('⏳ กำลังอ่านไฟล์ schema.sql และสร้างตารางบน Supabase...');
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        await db.query(sql);
        console.log('✅ สร้างตารางทั้งหมดบน Supabase สำเร็จเรียบร้อยแล้ว!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error.message);
        process.exit(1);
    }
}

runMigration();
