"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

export interface TopVideoItem {
    id: string;
    rank: number;
    title: string;
    thumbnail: string;
    duration: string;
    date: string;
    postedTime: string;
    views:number;
    viewsFormatted: string;
    likes: string;
    comments: string;
    shares: string;
    engagementRate: string;
}
const MOCK_TOP_VIDEOS: TopVideoItem[] = [
  {
    id: "1",
    rank: 1,
    title: "5 เทคนิคถ่ายคลิปด้วยมือถือ ให้ดูโปรขึ้น 10 เท่า",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=350&q=80",
    duration: "01:23",
    date: "Jun 18, 2025",
    postedTime: "2:15 PM",
    views: 5210000,
    viewsFormatted: "5.21M",
    likes: "312.4K",
    comments: "12.6K",
    shares: "28.4K",
    engagementRate: "6.78%",
  },
  {
    id: "2",
    rank: 2,
    title: "POV: เช้าวันหยุดที่โคตรดี",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&h=350&q=80",
    duration: "00:58",
    date: "Jun 14, 2025",
    postedTime: "9:40 AM",
    views: 4320000,
    viewsFormatted: "4.32M",
    likes: "245.6K",
    comments: "9.8K",
    shares: "19.7K",
    engagementRate: "6.36%",
  },
  {
    id: "3",
    rank: 3,
    title: "เมนูง่ายๆ อร่อยเหมือนร้านดัง",
    thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&h=350&q=80",
    duration: "01:07",
    date: "Jun 11, 2025",
    postedTime: "6:22 PM",
    views: 3890000,
    viewsFormatted: "3.89M",
    likes: "198.3K",
    comments: "7.2K",
    shares: "14.1K",
    engagementRate: "5.70%",
  },
  {
    id: "4",
    rank: 4,
    title: "ไอเดียแต่งห้องนอน มินิมอล แต่น่าอยู่",
    thumbnail: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=200&h=350&q=80",
    duration: "01:35",
    date: "Jun 8, 2025",
    postedTime: "11:05 AM",
    views: 3210000,
    viewsFormatted: "3.21M",
    likes: "176.8K",
    comments: "6.1K",
    shares: "11.3K",
    engagementRate: "5.32%",
  },
  {
    id: "5",
    rank: 5,
    title: "ชีวิตตอนกลางคืนที่ไม่ค่อยมีใครรู้",
    thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=200&h=350&q=80",
    duration: "00:46",
    date: "Jun 6, 2025",
    postedTime: "8:30 PM",
    views: 2760000,
    viewsFormatted: "2.76M",
    likes: "152.9K",
    comments: "5.3K",
    shares: "9.2K",
    engagementRate: "5.17%",
  },
];
interface TopVideosCardProps {
  videos?: TopVideoItem[];
  viewAllHref?: string;
  onViewAll?: () => void;
}

export function TopVideosCard({
  videos = MOCK_TOP_VIDEOS,
  viewAllHref = "/videos",
  onViewAll,
}: TopVideosCardProps) {
  // คำนวณ View สูงสุดเพื่อสร้าง Progress Bar ที่ได้สัดส่วน
  const maxViews = Math.max(...videos.map((v) => v.views), 1);

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 text-zinc-100 shadow-xl overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              Top 5 videos by views
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Your best-performing content in the selected period.
            </p>
          </div>
        </div>
        {onViewAll ? (
          <button
            onClick={onViewAll}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
          >
            View all videos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            href={viewAllHref}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
          >
            View all videos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {/* Table Section */}
      <div className="w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] sm:text-[11px] font-medium text-zinc-400 border-b border-zinc-800/60">
              <th className="py-2 px-1 w-5 text-center">#</th>
              <th className="py-2 px-1">Video</th>
              <th className="py-2 px-1">Views</th>
              <th className="py-2 px-1">Likes</th>
              <th className="py-2 px-1">Comments</th>
              <th className="py-2 px-1">Shares</th>
              <th className="py-2 px-1 text-right">Engagement rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 text-[11px]">
            {videos.map((video) => {
              const viewPercentage = Math.min(
                100,
                Math.round((video.views / maxViews) * 100)
              );
              return (
                <tr
                  key={video.id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-2.5 px-1 text-center text-zinc-300 font-medium text-xs sm:text-sm">
                    {video.rank}
                  </td>
                  {/* Video Thumbnail (Vertical 9:16 TikTok style) & Details */}
                  <td className="py-2.5 px-1 sm:px-2">
                    <div className="flex items-center gap-2.5">
                      {/* Vertical Thumbnail - Perfect Compact Fit */}
                      <div className="relative w-9 h-13 sm:w-10 sm:h-14 rounded-md overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800 shadow-xs group-hover:border-zinc-700 transition-colors">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback ถ้า URL รูปภาพหมดอายุหรือโหลดไม่ได้
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=600&q=90";
                          }}
                        />
                        <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-[8px] sm:text-[8.5px] font-mono text-zinc-200 px-0.5 py-0.2 rounded leading-none font-medium">
                          {video.duration}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-medium text-zinc-100 truncate max-w-[110px] min-[420px]:max-w-[160px] sm:max-w-[220px]">
                          {video.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">
                          {video.date} <span className="mx-0.5">•</span> {video.postedTime}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Views + Cyan Progress Bar */}
                  <td className="py-2.5 px-1.5 sm:px-2 align-middle">
                    <div className="w-16 sm:w-20">
                      <div className="text-xs sm:text-sm font-semibold text-zinc-100 mb-1">
                        {video.viewsFormatted}
                      </div>
                      <div className="w-full bg-zinc-800/80 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${viewPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Likes */}
                  <td className="py-2.5 px-1.5 sm:px-2 text-zinc-200 font-medium align-middle whitespace-nowrap text-xs sm:text-sm">
                    {video.likes}
                  </td>
                  {/* Comments */}
                  <td className="py-2.5 px-1.5 sm:px-2 text-zinc-200 font-medium align-middle whitespace-nowrap text-xs sm:text-sm">
                    {video.comments}
                  </td>
                  {/* Shares */}
                  <td className="py-2.5 px-1.5 sm:px-2 text-zinc-200 font-medium align-middle whitespace-nowrap text-xs sm:text-sm">
                    {video.shares}
                  </td>
                  {/* Engagement Rate */}
                  <td className="py-2.5 px-1.5 sm:px-2 text-emerald-400 font-semibold text-right align-middle whitespace-nowrap text-xs sm:text-sm">
                    {video.engagementRate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}