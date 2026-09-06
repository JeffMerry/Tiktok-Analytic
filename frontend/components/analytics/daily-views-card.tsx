"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Flame } from "lucide-react";

export interface DayStatItem {
  dayIndex: number;
  dayName: string;
  dayNameTH: string;
  dayShortTH: string;
  videoCount: number;
  avgViews: number;
  avgLikes: number;
  avgEngagement: number;
}

interface DailyViewsCardProps {
  data?: DayStatItem[];
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

function CustomBarLabel(props: any) {
  const { x, y, width, value } = props;
  if (!value || value <= 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#e2e8f0"
      textAnchor="middle"
      fontSize={11}
      fontWeight="bold"
    >
      {formatCompact(value)}
    </text>
  );
}

export function DailyViewsCard({ data }: DailyViewsCardProps) {
  // Default demo days if data is empty
  const chartData = useMemo(() => {
    if (data && data.length > 0 && data.some((d) => d.avgViews > 0)) {
      return data;
    }
    return [
      { dayShortTH: "จันทร์", avgViews: 15200000, avgEngagement: 7.2, videoCount: 22 },
      { dayShortTH: "อังคาร", avgViews: 13800000, avgEngagement: 6.8, videoCount: 18 },
      { dayShortTH: "พุธ", avgViews: 16700000, avgEngagement: 8.5, videoCount: 25 },
      { dayShortTH: "พฤหัสบดี", avgViews: 14900000, avgEngagement: 7.1, videoCount: 20 },
      { dayShortTH: "ศุกร์", avgViews: 12600000, avgEngagement: 6.4, videoCount: 19 },
      { dayShortTH: "เสาร์", avgViews: 11300000, avgEngagement: 5.9, videoCount: 15 },
      { dayShortTH: "อาทิตย์", avgViews: 9800000, avgEngagement: 5.2, videoCount: 14 },
    ];
  }, [data]);

  const maxViewVal = useMemo(
    () => Math.max(...chartData.map((d) => d.avgViews), 1),
    [chartData]
  );

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 text-zinc-100 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              ยอดวิวเฉลี่ยรายวัน (จันทร์ - อาทิตย์)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              เปรียบเทียบยอดวิวเฉลี่ยในแต่ละวันของสัปดาห์
            </p>
          </div>
        </div>

        {/* Dropdown pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-medium self-start sm:self-auto">
          <span>ค่าเฉลี่ยต่อวัน</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-72 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              {/* Highlight Peak Day Gradient (Cyan Glow) */}
              <linearGradient id="peakDayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8} />
              </linearGradient>

              {/* Normal Day Gradient (Blue Glow) */}
              <linearGradient id="normalDayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f242d"
              vertical={false}
            />

            <XAxis
              dataKey="dayShortTH"
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: "#272e3b" }}
              tickLine={false}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCompact(v)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-zinc-900/95 border border-zinc-700/80 text-xs p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[140px]">
                      <div className="font-bold text-white border-b border-zinc-800 pb-1 mb-1.5">
                        วัน{item.dayShortTH}
                      </div>
                      <div className="text-cyan-400 font-semibold">
                        ยอดวิวเฉลี่ย: {Number(item.avgViews).toLocaleString()}
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-0.5">
                        จำนวนคลิป: {item.videoCount} คลิป
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey="avgViews"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              <LabelList dataKey="avgViews" content={<CustomBarLabel />} />
              {chartData.map((entry, index) => {
                const isMax = entry.avgViews === maxViewVal && maxViewVal > 0;
                return (
                  <Cell
                    key={`day-bar-${index}`}
                    fill={isMax ? "url(#peakDayGrad)" : "url(#normalDayGrad)"}
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
