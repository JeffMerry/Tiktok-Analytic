"use client";

import { useEffect, useState, useCallback} from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { StatCardsGrid, ChannelOverviewData } from "@/components/stats/stat-cards-grid";
import { GrowthChartCard, GrowthData } from "@/components/stats/growth-chart-card";
import { TopVideosCard, TopVideoItem } from "@/components/stats/top-videos-card";
import { QuickBenchmarksCard } from "@/components/stats/quick-benchmarks-card";
import { InteractionBreakdownCard } from "@/components/stats/interaction-breakdown-card";
import { RotateCw, Check} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export default function Page() {
  const [data, setData] = useState<ChannelOverviewData | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [topVideos, setTopVideos] = useState<TopVideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  
  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // หากเป็นการรีเฟรชข้อมูลแบบกดเอง (Manual Refresh)
      // ให้สั่งยิง API สแครปข้อมูลสดล่าสุดจาก TikTok เข้า Database ก่อน
      if (isManualRefresh) {
        try {
          const trackRes = await fetch(`${API_BASE_URL}/track/jjayallday`);
          if (!trackRes.ok) {
            console.warn("⚠️ ไม่สามารถ Sync ข้อมูลสดจาก TikTok ได้ ดึงข้อมูลล่าสุดจาก DB แทน");
          }
        } catch (syncErr) {
          console.warn("⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ Sync กับ TikTok:", syncErr);
        }
      }

      const [channelRes, videosRes, growthRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/channel/jjayallday`),
        fetch(`${API_BASE_URL}/analytics/videos/jjayallday?sortBy=views_count&order=DESC&limit=5`),
        fetch(`${API_BASE_URL}/analytics/growth/jjayallday?days=30`),
      ]);

      if ( !channelRes.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลจากระบบได้");
      }

      const channelResult = await channelRes.json();
      if (channelResult.data) {
        setData(channelResult.data);
      } else {
        throw new Error(channelResult.message || "ไม่พบข้อมูลในระบบ");
      }

      if (videosRes.ok) {
        const videosResult = await videosRes.json();
        if (videosResult.data && Array.isArray(videosResult.data)) {
          const mapped: TopVideoItem[] = videosResult.data.map((video: any, index: number) => {
            const views = Number(video.views_count || 0);
            const likes = Number(video.likes_count || 0)
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
              id: video.tiktok_video_id || String(index + 1),
              rank: index + 1,
              title: video.caption || "Untitled Video",
              thumbnail: video.cover_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=350&q=80`,
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
          });
          setTopVideos(mapped);
        }
      }

      if (growthRes.ok) {
        const growthResult = await growthRes.json();
        if (growthResult.data) {
          setGrowthData(growthResult.data);
        }
      }

      setLastUpdated(new Date());

       if (isManualRefresh) {
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2000);
      }

    }catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const [range, setRange] = useState("28d");
  const ranges = ["7d", "28d", "90d", "12m"];

 return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar พร้อมปุ่มกด Refresh และ Badge เช็คเวลาข้อมูลล่าสุด */}
        <Topbar
          rightContent={
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>
                    ข้อมูลล่าสุด ({lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.)
                  </span>
                </div>
              )}

              <button
                onClick={() => fetchAnalytics(true)}
                disabled={isRefreshing || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 disabled:opacity-50"
              >
                {refreshSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">อัปเดตแล้ว</span>
                  </>
                ) : (
                  <>
                    <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
                    <span>{isRefreshing ? "กำลังอัปเดต..." : "อัปเดตข้อมูลล่าสุด"}</span>
                  </>
                )}
              </button>
            </div>
          }
        >
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-balance">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Performance metrics & latest database channel analytics
            </p>
          </div>
        </Topbar>
        <main className="flex-1 space-y-6 px-5 py-6 sm:px-8">
          {loading && (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              กำลังโหลดข้อมูล...
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && data && (
            <div className="space-y-6">
              <StatCardsGrid data={data} />
              
              {/* Channel Growth Chart & 30-Day Growth Summary */}
              <GrowthChartCard data={growthData} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <TopVideosCard videos={topVideos.length > 0 ? topVideos : undefined} />
                <div className="space-y-6">
                  <QuickBenchmarksCard
                    data={{
                      avgViews: data.metrics.avgViewsPerVideo || 0,
                      avgLikes: Math.round(data.metrics.totalLikes / (data.metrics.totalVideosTracked || 1)),
                      avgComments: Math.round((data.metrics.totalComments || 0) / (data.metrics.totalVideosTracked || 1)),
                      avgShares: Math.round((data.metrics.totalShares || 0) / (data.metrics.totalVideosTracked || 1)),
                    }}
                  />
                  <InteractionBreakdownCard
                    data={{
                      totalLikes: data.metrics.totalLikes,
                      totalComments: data.metrics.totalComments || 0,
                      totalShares: data.metrics.totalShares || 0,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}