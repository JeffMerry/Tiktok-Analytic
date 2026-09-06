"use client";

import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  comparisonText?: string;
  fromValueText?: string;
  sparklineData?: number[];
  icon?: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
  sparklineColor?: string;
  className?: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Custom Mini Sparkline with Dots & Glowing Area
function MiniSparkline({
  data,
  color = "#38bdf8",
  isPositive = true,
}: {
  data?: number[];
  color?: string;
  isPositive?: boolean;
}) {
  const points =
    data && data.length > 0
      ? data.length === 1
        ? [data[0] * 0.98, data[0]]
        : data
      : isPositive
      ? [10, 14, 18, 22, 28, 35, 42]
      : [42, 36, 30, 26, 20, 15, 10];

  const width = 110;
  const height = 44;
  const paddingY = 8;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((val, i) => {
    const x = (i / (points.length - 1)) * (width - 12) + 6;
    const y = height - paddingY - ((val - min) / range) * (height - paddingY * 2);
    return { x, y };
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)},${height} L ${coords[0].x.toFixed(1)},${height} Z`;

  const gradId = `sparkline-grad-${color.replace("#", "")}`;

  return (
    <div className="w-24 sm:w-28 h-11 shrink-0 overflow-visible">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Area */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Line Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots on Points */}
        {coords.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={i === coords.length - 1 ? 3.5 : 2.2}
            fill={color}
            stroke="#10131a"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </div>
  );
}

export function BaseStatCard({
  title,
  value,
  change = 0,
  comparisonText,
  fromValueText,
  sparklineData,
  icon: Icon,
  iconBgColor = "bg-blue-500/15 border-blue-500/30",
  iconColor = "text-blue-400",
  sparklineColor = "#38bdf8",
  className,
}: BaseStatCardProps) {
  const formattedValue = typeof value === "number" ? formatNumber(value) : value;
  const isPositive = change >= 0;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#10131a] p-4 sm:p-5 shadow-xl transition-all hover:border-zinc-700/90",
        className
      )}
    >
      {/* 1. Header (Icon + Thai Title) */}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${iconBgColor}`}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        )}
        <span className="text-sm font-semibold text-zinc-200 tracking-wide">
          {title}
        </span>
      </div>

      {/* 2. Middle Row (Big Value + % Change badge on Left, Sparkline on Right) */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formattedValue}
          </div>

          {/* Change Delta */}
          <div className="mt-1 flex items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center text-xs font-bold",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isPositive ? (
                <ArrowUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5 stroke-[2.5]" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          </div>
        </div>

        {/* Sparkline Graphic */}
        <MiniSparkline
          data={sparklineData}
          color={sparklineColor}
          isPositive={isPositive}
        />
      </div>

      {/* 3. Bottom Row (Comparison Text) */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 text-[11px] text-zinc-400/90 font-normal truncate">
        {fromValueText || comparisonText || "ยอดสะสมปัจจุบัน"}
      </div>
    </div>
  );
}
