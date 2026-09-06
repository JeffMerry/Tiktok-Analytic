"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, Play, Heart, Film, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface GrowthPoint {
  date: string;
  label: string;
  fullLabel?: string;
  followers: number;
  views: number;
  likes: number;
  videoCount: number;
}

export interface GrowthMetricSummary {
  current: number;
  diff: number;
  percent: number;
}

export interface GrowthData {
  days: number;
  chartData: GrowthPoint[];
  summary: {
    periodText?: string;
    followers: GrowthMetricSummary;
    views: GrowthMetricSummary;
    likes: GrowthMetricSummary;
    videoCount: GrowthMetricSummary;
  };
}

interface GrowthChartCardProps {
  data?: GrowthData | null;
  loading?: boolean;
}

type ActiveTab = "followers" | "views" | "likes" | "videoCount";

const TAB_CONFIG: Record<
  ActiveTab,
  { label: string; key: keyof GrowthPoint; color: string; gradientId: string }
> = {
  followers: {
    label: "ผู้ติดตาม",
    key: "followers",
    color: "#3b82f6", // Blue
    gradientId: "growth-followers-grad",
  },
  views: {
    label: "ยอดวิว",
    key: "views",
    color: "#06b6d4", // Cyan
    gradientId: "growth-views-grad",
  },
  likes: {
    label: "ยอดไลก์",
    key: "likes",
    color: "#ec4899", // Pink
    gradientId: "growth-likes-grad",
  },
  videoCount: {
    label: "จำนวนคลิป",
    key: "videoCount",
    color: "#8b5cf6", // Purple
    gradientId: "growth-videos-grad",
  },
};

function formatCompact(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
  return num.toLocaleString();
}

function formatSigned(num: number): string {
  if (num > 0) return `+${num.toLocaleString()}`;
  return num.toLocaleString();
}

// Custom Tooltip
function CustomGrowthTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload as GrowthPoint;

  return (
    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-md min-w-[170px] text-xs space-y-2">
      <div className="font-semibold text-zinc-300 border-b border-zinc-800 pb-1.5">
        {point.fullLabel || point.label}
      </div>
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            ผู้ติดตาม
          </span>
          <span className="font-bold text-white">
            {point.followers.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            ยอดวิว
          </span>
          <span className="font-bold text-white">
            {point.views.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            ยอดไลก์
          </span>
          <span className="font-bold text-white">
            {point.likes.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            จำนวนคลิป
          </span>
          <span className="font-bold text-zinc-300">
            {point.videoCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GrowthChartCard({ data, loading }: GrowthChartCardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("followers");

  // Fallback demo points if data is empty or single point
  const chartPoints = useMemo(() => {
    if (data?.chartData && data.chartData.length > 0) {
      if (data.chartData.length === 1) {
        // Expand single point to show a clean horizontal line
        const p = data.chartData[0];
        return [
          { ...p, label: "เริ่มต้น" },
          { ...p, label: "ปัจจุบัน" },
        ];
      }
      return data.chartData;
    }
    // Default baseline
    return [
      { date: "2026-08-06", label: "6 ส.ค.", followers: 120000, views: 5000000, likes: 110000, videoCount: 130 },
      { date: "2026-08-14", label: "14 ส.ค.", followers: 121500, views: 5400000, likes: 135000, videoCount: 133 },
      { date: "2026-08-22", label: "22 ส.ค.", followers: 123000, views: 6100000, likes: 160000, videoCount: 136 },
      { date: "2026-08-30", label: "30 ส.ค.", followers: 124800, views: 6800000, likes: 200000, videoCount: 139 },
      { date: "2026-09-05", label: "5 ก.ย.", followers: 125730, views: 7154360, likes: 230260, videoCount: 142 },
    ];
  }, [data?.chartData]);

  const summary = data?.summary || {
    periodText: "สรุปการเติบโต 30 วัน",
    followers: { current: 125730, diff: 5730, percent: 4.8 },
    views: { current: 7154360, diff: 1954360, percent: 12.3 },
    likes: { current: 230260, diff: 120260, percent: 10.7 },
    videoCount: { current: 142, diff: 12, percent: 9.2 },
  };

  const activeConfig = TAB_CONFIG[activeTab];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* 1. การเติบโตของช่อง (Chart Area) - spans 2 cols */}
      <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-[#10131a] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        {/* Header with Title & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              การเติบโตของช่อง
            </h2>
            {/* Dynamic Legend */}
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: activeConfig.color }}
                />
                <span className="text-zinc-300 font-medium">
                  {activeConfig.label}
                </span>
              </div>
              {activeTab !== "videoCount" && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400 font-medium">จำนวนคลิป</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
            {(Object.keys(TAB_CONFIG) as ActiveTab[]).map((tabKey) => {
              const tab = TAB_CONFIG[tabKey];
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-64 sm:h-72 md:h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartPoints}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={activeConfig.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={activeConfig.color}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={activeConfig.color}
                    stopOpacity={0.0}
                  />
                </linearGradient>
                <linearGradient id="videoCount-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f242d"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#272e3b" }}
                tickLine={false}
              />

              {/* Left Y Axis for Selected Metric */}
              <YAxis
                yAxisId="primary"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatCompact(val)}
                domain={["auto", "auto"]}
              />

              {/* Right Y Axis for Video Count (if not in videoCount tab) */}
              {activeTab !== "videoCount" && (
                <YAxis
                  yAxisId="secondary"
                  orientation="right"
                  stroke="#52525b"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
              )}

              <Tooltip content={<CustomGrowthTooltip />} />

              {/* Secondary Line (Video Count) */}
              {activeTab !== "videoCount" && (
                <Area
                  yAxisId="secondary"
                  type="monotone"
                  dataKey="videoCount"
                  stroke="#71717a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#videoCount-grad)"
                  dot={{ r: 3.5, fill: "#71717a", strokeWidth: 1 }}
                  activeDot={{ r: 5, fill: "#a1a1aa" }}
                />
              )}

              {/* Primary Active Metric Line */}
              <Area
                yAxisId="primary"
                type="monotone"
                dataKey={activeConfig.key}
                stroke={activeConfig.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${activeConfig.gradientId})`}
                dot={{
                  r: 4,
                  fill: activeConfig.color,
                  stroke: "#10131a",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: activeConfig.color,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. สรุปการเติบโต 30 วัน (Summary Card List) - spans 1 col */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#10131a] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide mb-4 pb-3 border-b border-zinc-800/60">
            {summary.periodText || "สรุปการเติบโต 30 วัน"}
          </h2>

          <div className="space-y-3.5">
            {/* 1. ผู้ติดตาม */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 transition-colors hover:border-zinc-700/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">ผู้ติดตาม</div>
                  <div className="text-[11px] text-zinc-500">ยอดสะสมช่อง</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-white tracking-tight">
                  {formatSigned(summary.followers.diff)}
                </div>
                <div
                  className={`text-xs font-semibold flex items-center justify-end ${
                    summary.followers.percent >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {summary.followers.percent >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {summary.followers.percent >= 0
                    ? `+${summary.followers.percent}%`
                    : `${summary.followers.percent}%`}
                </div>
              </div>
            </div>

            {/* 2. ยอดวิว */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 transition-colors hover:border-zinc-700/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Play className="w-5 h-5 fill-cyan-400/20" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">ยอดวิว</div>
                  <div className="text-[11px] text-zinc-500">ยอดสะสมช่อง</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-white tracking-tight">
                  {formatSigned(summary.views.diff)}
                </div>
                <div
                  className={`text-xs font-semibold flex items-center justify-end ${
                    summary.views.percent >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {summary.views.percent >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {summary.views.percent >= 0
                    ? `+${summary.views.percent}%`
                    : `${summary.views.percent}%`}
                </div>
              </div>
            </div>

            {/* 3. ยอดไลก์ */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 transition-colors hover:border-zinc-700/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <Heart className="w-5 h-5 fill-pink-400/20" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">ยอดไลก์</div>
                  <div className="text-[11px] text-zinc-500">ยอดสะสมช่อง</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-white tracking-tight">
                  {formatSigned(summary.likes.diff)}
                </div>
                <div
                  className={`text-xs font-semibold flex items-center justify-end ${
                    summary.likes.percent >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {summary.likes.percent >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {summary.likes.percent >= 0
                    ? `+${summary.likes.percent}%`
                    : `${summary.likes.percent}%`}
                </div>
              </div>
            </div>

            {/* 4. จำนวนคลิป */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 transition-colors hover:border-zinc-700/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">จำนวนคลิป</div>
                  <div className="text-[11px] text-zinc-500">ยอดสะสมช่อง</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-white tracking-tight">
                  {formatSigned(summary.videoCount.diff)}
                </div>
                <div
                  className={`text-xs font-semibold flex items-center justify-end ${
                    summary.videoCount.percent >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {summary.videoCount.percent >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {summary.videoCount.percent >= 0
                    ? `+${summary.videoCount.percent}%`
                    : `${summary.videoCount.percent}%`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 text-center">
          📊 อัปเดตสถิติรายวันจากฐานข้อมูลอัตโนมัติ
        </div>
      </div>
    </div>
  );
}
