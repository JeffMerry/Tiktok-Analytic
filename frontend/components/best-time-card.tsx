"use client";

import React, { useState } from "react";
import { Clock, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BestTimeData {
  recommendation: {
    bestDay: string;
    bestHour: string;
    avgViews: number;
    avgEngagement: number;
  };
  byDay: Array<{
    dayIndex: number;
    dayName: string;
    dayNameTH: string;
    videoCount: number;
    avgViews: number;
    avgLikes: number;
    avgEngagement: number;
  }>;
  byHour: Array<{
    hour: number;
    label: string;
    videoCount: number;
    avgViews: number;
    avgLikes: number;
    avgEngagement: number;
  }>;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

export function BestTimeCard({ data }: { data: BestTimeData }) {
  const [activeTab, setActiveTab] = useState<"day" | "hour">("day");
  const { recommendation, byDay, byHour } = data;

  const maxDayViews = Math.max(...byDay.map((d) => d.avgViews), 1);
  const maxHourViews = Math.max(...byHour.map((h) => h.avgViews), 1);

  return (
    <div className="space-y-6">
      {/* 1. Recommendation Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-card to-cyan-950/30 p-6 shadow-lg">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Recommendation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              เวลาโพสต์ที่ดีที่สุด:{" "}
              <span className="text-emerald-400">
                {recommendation.bestDay} ช่วง {recommendation.bestHour} น.
              </span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              จากสถิติประวัติการโพสต์วิดีโอทั้งหมด การโพสต์ในช่วงเวลานี้สร้างยอดวิวเฉลี่ยสูงสุดถึง{" "}
              <strong className="text-foreground">{formatNumber(recommendation.avgViews)} Views</strong>{" "}
              ต่อคลิป
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-border/80 bg-background/60 p-4 text-center backdrop-blur-sm min-w-[110px]">
              <span className="text-[11px] text-muted-foreground block">ยอดวิวเฉลี่ยสูงสุด</span>
              <span className="text-lg font-bold text-emerald-400">
                {formatNumber(recommendation.avgViews)}
              </span>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/60 p-4 text-center backdrop-blur-sm min-w-[110px]">
              <span className="text-[11px] text-muted-foreground block">Engagement</span>
              <span className="text-lg font-bold text-cyan-400">
                {recommendation.avgEngagement.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Container */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              วิเคราะห์ยอดวิวเฉลี่ยตามเวลา (Average Views Breakdown)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              เปรียบเทียบสถิติการรับชมแยกตามวันในสัปดาห์และช่วงเวลาชั่วโมง
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs">
            <button
              onClick={() => setActiveTab("day")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all",
                activeTab === "day"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>รายวัน (Sun - Sat)</span>
            </button>
            <button
              onClick={() => setActiveTab("hour")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all",
                activeTab === "hour"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>รายชั่วโมง (24h)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Day of Week Bar Chart */}
        {activeTab === "day" && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-56 pt-6 pb-2 border-b border-border/40">
              {byDay.map((item) => {
                const heightPercent = Math.max((item.avgViews / maxDayViews) * 100, 6);
                const isBest = item.dayNameTH === recommendation.bestDay;

                return (
                  <div key={item.dayIndex} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 text-white text-[10px] rounded-md px-2 py-1 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      <div className="font-semibold text-emerald-400">{item.dayNameTH}</div>
                      <div>Avg: {formatNumber(item.avgViews)} views</div>
                      <div className="text-zinc-400">{item.videoCount} videos</div>
                    </div>

                    <div className="text-[11px] font-semibold mb-1 text-muted-foreground group-hover:text-foreground">
                      {formatNumber(item.avgViews)}
                    </div>

                    {/* Bar */}
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-300 group-hover:brightness-125",
                        isBest
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-emerald-500/20 hover:bg-emerald-500/40"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
              {byDay.map((item) => {
                const isBest = item.dayNameTH === recommendation.bestDay;
                return (
                  <div key={item.dayIndex}>
                    <span
                      className={cn(
                        "text-xs font-medium block",
                        isBest ? "text-emerald-400 font-bold" : "text-muted-foreground"
                      )}
                    >
                      {item.dayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 block">
                      ({item.videoCount} คลิป)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Hourly (24h) Bar Chart */}
        {activeTab === "hour" && (
          <div className="space-y-4">
            <div className="flex items-end gap-1 h-56 pt-6 pb-2 border-b border-border/40 overflow-x-auto">
              {byHour.map((item) => {
                const heightPercent = Math.max((item.avgViews / maxHourViews) * 100, 4);
                const isBest = item.label === recommendation.bestHour;

                return (
                  <div
                    key={item.hour}
                    className="flex-1 min-w-[20px] flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 text-white text-[10px] rounded-md px-2 py-1 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      <div className="font-semibold text-cyan-400">เวลา {item.label} น.</div>
                      <div>Avg: {formatNumber(item.avgViews)} views</div>
                      <div className="text-zinc-400">{item.videoCount} videos</div>
                    </div>

                    {/* Bar */}
                    <div
                      className={cn(
                        "w-full rounded-t-sm transition-all duration-300 group-hover:brightness-125",
                        isBest
                          ? "bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/20"
                          : "bg-cyan-500/20 hover:bg-cyan-500/40"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground px-1">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
