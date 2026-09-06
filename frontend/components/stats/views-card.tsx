"use client";

import React from "react";
import { Play } from "lucide-react";
import { BaseStatCard } from "./base-stat-card";

export function ViewsCard({
  totalViews,
  change = 0,
  comparisonText,
  fromValueText,
  sparklineData,
}: {
  totalViews: number;
  avgViews?: number;
  change?: number;
  comparisonText?: string;
  fromValueText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="ยอดวิวรวม"
      value={totalViews}
      change={change}
      comparisonText={comparisonText}
      fromValueText={fromValueText}
      sparklineData={sparklineData}
      icon={Play}
      iconBgColor="bg-cyan-500/15 border-cyan-500/30"
      iconColor="text-cyan-400"
      sparklineColor="#22d3ee"
    />
  );
}
