-- 1. ตารางเก็บข้อมูลช่อง TikTok
CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางเก็บสถิติช่องรายวัน (สำหรับ Cron Job Tracker)
CREATE TABLE IF NOT EXISTS channel_daily_stats (
    id SERIAL PRIMARY KEY,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    followers INT NOT NULL,
    total_likes INT NOT NULL,
    video_count INT NOT NULL,
    record_date DATE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, record_date)
);

-- 3. ตารางเก็บข้อมูลระดับวิดีโอ (Metadata คงที่)
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    video_id VARCHAR(100) UNIQUE NOT NULL,
    caption TEXT,
    duration INT,
    cover_url TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางเก็บสถิติตัวเลขวิดีโอ (Time-series Video Stats)
CREATE TABLE IF NOT EXISTS video_stats (
    id SERIAL PRIMARY KEY,
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    favorites INT DEFAULT 0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางเก็บสถิติเชิงลึกหลังบ้าน
CREATE TABLE IF NOT EXISTS channel_insights (
    id SERIAL PRIMARY KEY,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    period_start DATE,
    period_end DATE,
    gender_ratio JSONB,
    age_distribution JSONB,
    territories JSONB,
    traffic_sources JSONB,
    completion_rate NUMERIC(5, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);