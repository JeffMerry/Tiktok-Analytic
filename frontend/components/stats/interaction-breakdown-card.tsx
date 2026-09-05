"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export interface InteractionBreakdownData {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
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

  const totalInteractions = useMemo(() => likes + comments + shares, [likes, comments, shares]);

  const chartData = useMemo(() => {
    return [
      { name: "Likes", value: likes, color: "#f43f5e" },      // Rose
      { name: "Comments", value: comments, color: "#3b82f6" },  // Blue
      { name: "Shares", value: shares, color: "#a855f7" },    // Purple
    ];
  }, [likes, comments, shares]);

  return (
    <div className="w-full bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 text-zinc-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
          <PieChartIcon className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Interaction Breakdown
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Distribution of audience engagement types.
          </p>
        </div>
      </div>

      {/* Chart & Legend Content */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        {/* Donut Chart */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
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
                      <div className="bg-zinc-900 border border-zinc-800 text-xs px-3 py-1.5 rounded-lg shadow-lg text-white">
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
          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xs font-semibold text-white">
              {formatNumber(totalInteractions)}
            </span>
            <span className="text-[9.5px] text-zinc-400 font-medium">Total Actions</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {chartData.map((item) => {
            const percentage = totalInteractions > 0 
              ? ((item.value / totalInteractions) * 100).toFixed(1) 
              : "0";
            return (
              <div
                key={item.name}
                className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-zinc-200">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-bold text-white">{percentage}%</span>
                  <span className="text-[11px] text-zinc-400">({formatNumber(item.value)})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
