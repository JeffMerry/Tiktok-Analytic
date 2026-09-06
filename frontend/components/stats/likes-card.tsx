"use client";

import React from "react";
import { Heart } from "lucide-react";
import { BaseStatCard } from "./base-stat-card";

export function LikesCard({
  likes,
  change = 0,
  comparisonText,
  fromValueText,
  sparklineData,
}: {
  likes: number;
  change?: number;
  comparisonText?: string;
  fromValueText?: string;
  sparklineData?: number[];
}) {
  return (
    <BaseStatCard
      title="ยอดไลก์รวม"
      value={likes}
      change={change}
      comparisonText={comparisonText}
      fromValueText={fromValueText}
      sparklineData={sparklineData}
      icon={Heart}
      iconBgColor="bg-pink-500/15 border-pink-500/30"
      iconColor="text-pink-400"
      sparklineColor="#f43f5e"
    />
  );
}
