import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ChannelProfile {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  followers: number;
  likes: number;
  videoCount: number;
}

export interface ChannelMetrics {
  totalVideosTracked: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgViewsPerVideo: number;
  avgEngagementRate: number;
}

export interface TopVideo {
  tiktok_video_id: string;
  caption: string;
  views_count: number;
  likes_count: number;
  engagement_rate: string;
  posted_at: string;
}

export interface ChannelAnalyticsResponse {
  status: string;
  data: {
    profile: ChannelProfile;
    metrics: ChannelMetrics;
    topVideo: TopVideo | null;
  };
}

export interface VideoItem {
  tiktok_video_id: string;
  caption: string;
  duration: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  engagement_rate: number;
  posted_at: string;
}

// 1. ดึงข้อมูลสรุปภาพรวมช่อง
export const getChannelAnalytics = async (username: string): Promise<ChannelAnalyticsResponse> => {
  const res = await axios.get(`${API_BASE_URL}/analytics/channel/${username}`);
  return res.data;
};

// 2. ดึงรายการวิดีโอ
export const getChannelVideos = async (
  username: string, 
  sortBy: string = 'views_count', 
  page: number = 1
) => {
  const res = await axios.get(`${API_BASE_URL}/analytics/videos/${username}`, {
    params: { sortBy, order: 'DESC', limit: 10, page }
  });
  return res.data;
};