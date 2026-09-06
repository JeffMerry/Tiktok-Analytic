"use client";

import React from "react";
import { BaseStatCard } from "./base-stat-card";

export function ViewsCard({
  totalViews,
  change = 0,
  comparisonText = "vs previous",
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

