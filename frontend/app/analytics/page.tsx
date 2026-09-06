"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ArrowLeft, BarChart3, Sparkles } from "lucide-react";
import { DailyViewsCard, DayStatItem } from "@/components/analytics/daily-views-card";
import { HourlyViewsCard, HourStatItem } from "@/components/analytics/hourly-views-card";
import { TimeSlotsHeatmapCard, HeatmapDayRow } from "@/components/analytics/time-slots-heatmap-card";
import { API_BASE_URL } from "@/lib/config";

interface AnalyticsResponseData {
  recommendation: {
    bestDay: string;
    bestHour: string;
    avgViews: number;
    avgEngagement: number;
  };
  byDay: DayStatItem[];
  byHour: HourStatItem[];
  heatmap?: HeatmapDayRow[];
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/analytics/best-time/jjayallday`);
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูล Analytics ได้");
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        } else {
          throw new Error(json.message || "ไม่พบข้อมูลสถิติ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <Topbar>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Analytics Deep Dive
              </h1>
              <p className="text-xs text-muted-foreground">
                สถิติและช่วงเวลาที่ควรโพสต์คอนเทนต์ที่สร้างยอดวิวสูงสุด
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors bg-zinc-900/90 border border-zinc-800 px-3.5 py-1.5 rounded-xl shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              กลับหน้า Overview
            </Link>
          </div>
        </Topbar>

        <main className="flex-1 space-y-6 px-5 py-6 sm:px-8">
          {/* AI Recommendation Banner */}
          {data?.recommendation && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-[#10131a] to-blue-950/30 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                    <span>ช่วงเวลาโพสต์ที่ยอดวิวเฉลี่ยสูงสุด</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                    {data.recommendation.bestDay} ช่วง {data.recommendation.bestHour} น.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-zinc-400">ยอดวิวเฉลี่ย: </span>
                  <span className="font-bold text-white">
                    {formatNumber(data.recommendation.avgViews)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-zinc-400">ER: </span>
                  <span className="font-bold text-purple-400">
                    {data.recommendation.avgEngagement}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              กำลังวิเคราะห์ช่วงเวลาและสร้าง Heatmap...
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Row 1: 2-Column Grid (Daily Views Bar Chart + Hourly Views Bar Chart) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                <DailyViewsCard data={data?.byDay} />
                <HourlyViewsCard data={data?.byHour} />
              </div>

              {/* Row 2: Full-Width Heatmap Matrix (7 Days x 24 Hours) */}
              <TimeSlotsHeatmapCard data={data?.heatmap} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
