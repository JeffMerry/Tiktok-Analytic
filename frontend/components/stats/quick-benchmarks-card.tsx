"use client";

import React from "react";
import { Play, Heart, MessageCircle, Share2, Compass } from "lucide-react";

export interface QuickBenchmarksData {
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

interface QuickBenchmarksCardProps {
  data?: QuickBenchmarksData;
}

export function QuickBenchmarksCard({ data }: QuickBenchmarksCardProps) {
  const items = [
    {
      title: "Views",
      subLabel: "ยอดชม",
      value: formatNumber(data?.avgViews ?? 132300),
      icon: Play,
      iconColor: "text-blue-400",
      iconFill: "fill-blue-400",
    },
    {
      title: "Likes",
      subLabel: "ยอดถูกใจ",
      value: formatNumber(data?.avgLikes ?? 9260),
      icon: Heart,
      iconColor: "text-rose-400",
      iconFill: "fill-rose-400",
    },
    {
      title: "Comments",
      subLabel: "Comments",
      value: formatNumber(data?.avgComments ?? 542),
      icon: MessageCircle,
      iconColor: "text-cyan-400",
      iconFill: "fill-cyan-400",
    },
    {
      title: "Shares",
      subLabel: "Shares",
      value: formatNumber(data?.avgShares ?? 1043),
      icon: Share2,
      iconColor: "text-purple-400",
      iconFill: "",
    },
  ];

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-5 text-zinc-100 shadow-xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Quick Benchmarks
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">
            ค่าเฉลี่ยต่อ 1 คลิป
          </p>
        </div>
      </div>

      {/* 4-Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900/70 border border-zinc-800/70 rounded-xl p-3.5 flex flex-col justify-between transition-colors hover:border-zinc-700/80"
            >
              <div>
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${item.iconColor} ${item.iconFill}`} />
                  <span className="text-xs font-semibold text-zinc-300">
                    {item.title}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  {item.subLabel}
                </div>
              </div>

              <div className="mt-3 text-base sm:text-lg font-black text-white tracking-tight">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
