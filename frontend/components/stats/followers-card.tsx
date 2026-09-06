"use client";

import React from "react";
import { BaseStatCard } from "./base-stat-card";

export function FollowersCard({
  followers,
  change = 0,
  comparisonText = "vs previous",
  sparklineData,
}: {
  followers: number;
  change?: number;
  comparisonText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="Followers"
      value={followers}
      change={change}
      comparisonText={comparisonText}
      sparklineData={sparklineData}
    />
  );
}

