"use client";

import React from "react";
import { BaseStatCard } from "./base-stat-card";

export function ViewsCard({
  totalViews,
  change = 8.1,
  comparisonText = "vs Jun 2 - Jun 29",
  sparklineData,
}: {
  totalViews: number;
  avgViews?: number;
  change?: number;
  comparisonText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="Video views"
      value={totalViews}
      change={change}
      comparisonText={comparisonText}
      sparklineData={sparklineData}
    />
  );
}

