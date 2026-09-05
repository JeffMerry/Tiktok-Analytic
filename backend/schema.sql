-- 1. ตารางเก็บข้อมูลช่อง TikTok
CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางเก็บสถิติรายวัน (สำหรับ Cron Job Tracker)
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    followers_count INT NOT NULL,
    likes_count INT NOT NULL,
    video_count INT NOT NULL,
    record_date DATE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, record_date)
);

-- 3. ตารางเก็บข้อมูลระดับวิดีโอ (สำหรับ Video Performance Analysis)
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    tiktok_video_id VARCHAR(100) UNIQUE NOT NULL,
    caption TEXT,
    duration INT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    engagement_rate NUMERIC(5, 2),
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางเก็บสถิติเชิงลึกหลังบ้านจากไฟล์ CSV
CREATE TABLE IF NOT EXISTS channel_private_insights (
    id SERIAL PRIMARY KEY,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    gender_ratio JSONB,
    age_distribution JSONB,
    top_territories JSONB,
    traffic_sources JSONB,
    completion_rate NUMERIC(5, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);