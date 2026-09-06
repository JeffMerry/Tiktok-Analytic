"use client";

import React from "react";
import { Zap } from "lucide-react";
import { BaseStatCard } from "./base-stat-card";

export function EngagementCard({
  rate,
  change = 0,
  comparisonText,
  fromValueText,
  sparklineData,
}: {
  rate: number;
  change?: number;
  comparisonText?: string;
  fromValueText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="อัตราการมีส่วนร่วม"
      value={`${rate.toFixed(2)}%`}
      change={change}
      comparisonText={comparisonText}
      fromValueText={fromValueText}
      sparklineData={sparklineData}
      icon={Zap}
      iconBgColor="bg-purple-500/15 border-purple-500/30"
      iconColor="text-purple-400"
      sparklineColor="#a855f7"
    />
  );
}
