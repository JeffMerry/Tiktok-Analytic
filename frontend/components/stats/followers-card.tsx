"use client";

import React from "react";
import { BaseStatCard } from "./base-stat-card";

export function FollowersCard({
  followers,
  change = 12.4,
  comparisonText = "vs Jun 2 - Jun 29",
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

