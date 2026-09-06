"use client";

import React from "react";
import { Eye, Heart, MessageSquare, Share2, Target } from "lucide-react";

export interface QuickBenchmarksData {
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

interface QuickBenchmarksCardProps {
  data?: QuickBenchmarksData;
}

export function QuickBenchmarksCard({ data }: QuickBenchmarksCardProps) {
  const benchmarks = [
    {
      label: "Avg. Views / Video",
      value: formatNumber(data?.avgViews ?? 521000),
      icon: Eye,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Avg. Likes / Video",
      value: formatNumber(data?.avgLikes ?? 42500),
      icon: Heart,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "Avg. Comments / Video",
      value: formatNumber(data?.avgComments ?? 1850),
      icon: MessageSquare,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Avg. Shares / Video",
      value: formatNumber(data?.avgShares ?? 3400),
      icon: Share2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 text-zinc-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Quick Benchmarks
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Average performance metrics per posted video.
          </p>
        </div>
      </div>

      {/* Grid of benchmark items */}
      <div className="grid grid-cols-2 gap-3">
        {benchmarks.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between transition-all hover:border-zinc-700/80"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-medium text-zinc-400 truncate">
                  {item.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${item.bgColor}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
              </div>
              <div className="text-lg font-bold text-white tracking-tight">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
