"use client";

import React from "react";
import { BaseStatCard } from "./base-stat-card";

export function EngagementCard({
  rate,
  change = 0,
  comparisonText = "vs previous",
  sparklineData,
}: {
  rate: number;
  change?: number;
  comparisonText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="Engagement rate"
      value={`${rate}%`}
      change={change}
      comparisonText={comparisonText}
      sparklineData={sparklineData}
    />
  );
}

