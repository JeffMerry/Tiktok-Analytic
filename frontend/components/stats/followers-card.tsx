"use client";

import React from "react";
import { Users } from "lucide-react";
import { BaseStatCard } from "./base-stat-card";

export function FollowersCard({
  followers,
  change = 0,
  comparisonText,
  fromValueText,
  sparklineData,
}: {
  followers: number;
  change?: number;
  comparisonText?: string;
  fromValueText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="ผู้ติดตาม"
      value={followers}
      change={change}
      comparisonText={comparisonText}
      fromValueText={fromValueText}
      sparklineData={sparklineData}
      icon={Users}
      iconBgColor="bg-blue-500/15 border-blue-500/30"
      iconColor="text-blue-400"
      sparklineColor="#38bdf8"
    />
  );
}
