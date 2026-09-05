"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "./utils";

export interface BaseStatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number;
  comparisonText?: string;
  sparklineData?: number[];
  icon?: React.ElementType;
  className?: string;
}

function Sparkline({ data, isPositive }: { data?: number[]; isPositive: boolean }) {
  const points =
    data && data.length > 0
      ? data
      : isPositive
      ? [10, 14, 12, 18, 22, 20, 26, 24, 30, 34, 32, 40, 42, 50]
      : [50, 45, 48, 38, 40, 32, 35, 28, 30, 24, 26, 20, 18, 15];

  const width = 180;
  const height = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathD = points.reduce((acc, val, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${acc} ${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, "");

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const gradientId = isPositive ? "sparkline-green" : "sparkline-red";

  return (
    <div className="mt-3 h-9 w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function BaseStatCard({
  title,
  value,
  subValue,
  change,
  comparisonText = "vs Jun 2 - Jun 29",
  sparklineData,
  icon: Icon,
  className,
}: BaseStatCardProps) {
  const formattedValue = typeof value === "number" ? formatNumber(value) : value;
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:border-border/80",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal text-muted-foreground">{title}</span>
          {Icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        <div className="mt-2.5 flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {formattedValue}
          </span>
          {subValue && (
            <span className="mt-0.5 text-xs text-muted-foreground/80">
              {subValue}
            </span>
          )}
        </div>

        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              {comparisonText}
            </span>
          </div>
        )}
      </div>

      <Sparkline data={sparklineData} isPositive={isPositive} />
    </div>
  );
}

