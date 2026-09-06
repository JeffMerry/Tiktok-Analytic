"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { TopVideosCard, TopVideoItem } from "@/components/stats/top-videos-card";
import { ArrowLeft, Video, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function mapApiVideoToTopVideo(video: any, rank: number): TopVideoItem {
  const views = Number(video.views_count || 0);
  const likes = Number(video.likes_count || 0);
  const comments = Number(video.comments_count || 0);
  const shares = Number(video.shares_count || 0);
  const er = Number(video.engagement_rate || 0);

  const postedDate = video.posted_at ? new Date(video.posted_at) : new Date();
  const dateFormatted = postedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted = postedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const durSec = typeof video.duration === "number" ? video.duration : parseInt(video.duration) || 0;
  const durMins = Math.floor(durSec / 60);
  const durRemSec = durSec % 60;
  const durationFormatted = `${durMins.toString().padStart(2, "0")}:${durRemSec.toString().padStart(2, "0")}`;

  return {
    id: video.tiktok_video_id || String(rank),
    rank: rank,
    title: video.caption || "Untitled Video",
    thumbnail: video.cover_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=350&q=80",
    duration: durationFormatted !== "00:00" ? durationFormatted : "01:00",
    date: dateFormatted,
    postedTime: timeFormatted,
    views: views,
    viewsFormatted: formatNumber(views),
    likes: formatNumber(likes),
    comments: formatNumber(comments),
    shares: formatNumber(shares),
    engagementRate: `${er.toFixed(2)}%`,
  };
}

export default function VideosPage() {
  const [videos, setVideos] = useState<TopVideoItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Fetch Videos by Page
  const fetchVideosPage = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(
        `${API_BASE_URL}/analytics/videos/jjayallday?page=${pageNum}&limit=20&sortBy=views_count&order=DESC`
      );

      if (!res.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลวิดีโอได้");
      }

      const result = await res.json();
      if (result.data && Array.isArray(result.data)) {
        const currentCount = isInitial ? 0 : videos.length;
        const newMapped: TopVideoItem[] = result.data.map((item: any, idx: number) =>
          mapApiVideoToTopVideo(item, currentCount + idx + 1)
        );

        if (isInitial) {
          setVideos(newMapped);
        } else {
          setVideos((prev) => [...prev, ...newMapped]);
        }

        if (result.pagination) {
          setTotalCount(result.pagination.total || 0);
          setHasMore(result.pagination.page < result.pagination.totalPages);
        } else {
          setHasMore(newMapped.length === 20);
        }
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ API");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [videos.length]);

  // Initial Fetch (Page 1)
  useEffect(() => {
    fetchVideosPage(1, true);
  }, []);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchVideosPage(nextPage, false);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = observerTarget.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadingMore, page, fetchVideosPage]);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  All Video Analytics
                </h1>
                <p className="text-xs text-zinc-400">
                  Detailed metrics for all your posted TikTok videos ({totalCount > 0 ? `${totalCount} videos` : "loading..."}).
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex h-40 items-center justify-center text-zinc-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span>กำลังดึงข้อมูลวิดีโอจากเซิร์ฟเวอร์...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="w-full space-y-4">
              <TopVideosCard videos={videos} />

              {/* Infinite Scroll Sentinel / Loading Status */}
              <div ref={observerTarget} className="py-6 flex justify-center items-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>กำลังโหลดวิดีโอเพิ่มเติม...</span>
                  </div>
                )}

                {!hasMore && videos.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>โหลดวิดีโอทั้งหมดแล้ว (รวม {videos.length} รายการ)</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
