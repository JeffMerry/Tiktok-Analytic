"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Clock } from "lucide-react";

export interface HourStatItem {
  hour: number;
  label: string;
  shortLabel?: string;
  videoCount: number;
  avgViews: number;
  avgLikes: number;
  avgEngagement: number;
}

interface HourlyViewsCardProps {
  data?: HourStatItem[];
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

export function HourlyViewsCard({ data }: HourlyViewsCardProps) {
  const [metricTab, setMetricTab] = useState<"views" | "engagement">("views");

  // Fallback demo hourly distribution
  const chartData = useMemo(() => {
    if (data && data.length > 0 && data.some((h) => h.avgViews > 0)) {
      return data.map((d) => ({
        ...d,
        displayLabel: d.hour.toString().padStart(2, "0"),
      }));
    }
    // Realistic creator hourly distribution with peak around 19:00 - 21:00
    const demoPattern = [
      5.2, 4.8, 3.9, 3.1, 2.5, 3.0, 4.0, 5.0, 5.8, 7.1, 8.2, 7.5,
      7.0, 7.9, 9.8, 10.5, 11.2, 12.8, 13.9, 15.6, 18.7, 16.4, 14.8, 13.0,
    ];
    return Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      displayLabel: h.toString().padStart(2, "0"),
      videoCount: 8,
      avgViews: Math.round(demoPattern[h] * 1_000_000),
      avgLikes: Math.round(demoPattern[h] * 80_000),
      avgEngagement: Number((4.5 + (demoPattern[h] / 18.7) * 4).toFixed(2)),
    }));
  }, [data]);

  const activeKey = metricTab === "views" ? "avgViews" : "avgEngagement";

  const maxVal = useMemo(
    () => Math.max(...chartData.map((d) => Number(d[activeKey])), 1),
    [chartData, activeKey]
  );

  const bestHourItem = useMemo(() => {
    return [...chartData].sort((a, b) => Number(b[activeKey]) - Number(a[activeKey]))[0];
  }, [chartData, activeKey]);

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 text-zinc-100 shadow-xl flex flex-col justify-between">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              ยอดวิวเฉลี่ยรายชั่วโมง (00:00 - 23:00 น.)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              ดูช่วงเวลาที่ผู้ชมเข้ามารับชมคอนเทนต์มากที่สุด
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setMetricTab("views")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              metricTab === "views"
                ? "bg-teal-500 text-zinc-950 font-bold shadow-md shadow-teal-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            ยอดวิว
          </button>
          <button
            onClick={() => setMetricTab("engagement")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              metricTab === "engagement"
                ? "bg-teal-500 text-zinc-950 font-bold shadow-md shadow-teal-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            การมีส่วนร่วม
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative w-full h-72 pt-4">
        {/* Highlight Peak Badge floating on top */}
        {bestHourItem && (
          <div className="absolute top-0 right-4 z-10 hidden sm:inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-zinc-900/90 px-3 py-1 text-xs font-semibold shadow-xl backdrop-blur-md">
            <span className="text-zinc-400">{bestHourItem.label}</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-cyan-400 font-bold">
              {metricTab === "views"
                ? formatCompact(bestHourItem.avgViews)
                : `${bestHourItem.avgEngagement}%`}
            </span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="peakHourGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="normalHourGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f242d"
              vertical={false}
            />

            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={{ stroke: "#272e3b" }}
              tickLine={false}
              interval={1}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                metricTab === "views" ? formatCompact(v) : `${v}%`
              }
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-zinc-900/95 border border-zinc-700/80 text-xs p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[130px]">
                      <div className="font-bold text-white border-b border-zinc-800 pb-1 mb-1.5">
                        เวลา {item.label} น.
                      </div>
                      <div className="text-cyan-400 font-semibold">
                        ยอดวิวเฉลี่ย: {Number(item.avgViews).toLocaleString()}
                      </div>
                      <div className="text-purple-400 font-semibold mt-0.5">
                        ER: {Number(item.avgEngagement).toFixed(2)}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey={activeKey}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            >
              {chartData.map((entry, index) => {
                const isMax = Number(entry[activeKey]) === maxVal && maxVal > 0;
                return (
                  <Cell
                    key={`hour-bar-${index}`}
                    fill={isMax ? "url(#peakHourGrad)" : "url(#normalHourGrad)"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
