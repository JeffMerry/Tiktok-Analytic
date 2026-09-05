"use client";

import React from "react";
import { BaseStatCard } from "./base-stat-card";

export function LikesCard({
  likes,
  change = 5.7,
  comparisonText = "vs Jun 2 - Jun 29",
  sparklineData,
}: {
  likes: number;
  change?: number;
  comparisonText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="Likes"
      value={likes}
      change={change}
      comparisonText={comparisonText}
      sparklineData={sparklineData}
    />
  );
}

