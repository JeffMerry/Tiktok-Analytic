"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export interface InteractionBreakdownData {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate?: number;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

interface InteractionBreakdownCardProps {
  data?: InteractionBreakdownData;
}

export function InteractionBreakdownCard({ data }: InteractionBreakdownCardProps) {
  const likes = data?.totalLikes ?? 21310000;
  const comments = data?.totalComments ?? 450000;
  const shares = data?.totalShares ?? 320000;
  const engagementRate = data?.engagementRate ?? 8.42;

  const totalInteractions = useMemo(() => likes + comments + shares, [likes, comments, shares]);

  const chartData = useMemo(() => {
    return [
      { name: "ไลก์", value: likes, color: "#f43f5e", icon: Heart },         // Rose/Pink
      { name: "คอมเมนต์", value: comments, color: "#38bdf8", icon: MessageCircle }, // Sky Blue
      { name: "แชร์", value: shares, color: "#8b5cf6", icon: Share2 },       // Purple
    ];
  }, [likes, comments, shares]);

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-5 text-zinc-100 shadow-xl">
      {/* Header */}
      <h3 className="text-base font-bold text-white tracking-wide mb-3">
        Engagement Breakdown
      </h3>

      {/* Donut Chart & Breakdown Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* Donut Chart with Center Engagement Rate */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const percent = totalInteractions > 0 
                      ? ((Number(item.value) / totalInteractions) * 100).toFixed(1) 
                      : "0";
                    return (
                      <div className="bg-zinc-900 border border-zinc-800 text-xs px-3 py-1.5 rounded-lg shadow-xl text-white">
                        <span className="font-semibold" style={{ color: item.payload.color }}>
                          {item.name}:
                        </span>{" "}
                        {formatNumber(Number(item.value))} ({percent}%)
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label (Engagement Rate %) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {engagementRate.toFixed(2)}%
            </span>
            <span className="text-[10px] text-zinc-400 font-medium -mt-0.5">
              Engagement Rate
            </span>
          </div>
        </div>

        {/* Legend List (Right side) */}
        <div className="flex-1 w-full space-y-3">
          {chartData.map((item) => {
            const percentage = totalInteractions > 0 
              ? ((item.value / totalInteractions) * 100).toFixed(1) 
              : "0";
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-zinc-900/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Icon className="w-4 h-4 fill-current" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-bold text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
