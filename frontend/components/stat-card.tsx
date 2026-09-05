"use client";

import React from "react";
import { 
  Users, 
  Eye, 
  Heart, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Video 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper สำหรับแปลงตัวเลขให้สวยงาม (เช่น 248600 -> 248.6K, 3940000 -> 3.94M)
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

// -------------------------------------------------------------
// 1. Single StatCard Component (การ์ดแสดงตัวเลขเดี่ยวๆ)
// -------------------------------------------------------------
export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number; // ตัวอย่าง +12.4 หรือ -0.4
  icon?: React.ElementType;
  className?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  const formattedValue = typeof value === 'number' ? formatNumber(value) : value;
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-border/100",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/80 text-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {formattedValue}
          </span>
          {subValue && (
            <span className="mt-1 text-xs text-muted-foreground/80">
              {subValue}
            </span>
          )}
        </div>

        {change !== undefined && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Profile Card Component (การ์ดแสดงข้อมูลโปรไฟล์ช่อง)
// -------------------------------------------------------------
export interface ProfileCardProps {
  displayName: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  videoCount?: number;
  className?: string;
}

export function ProfileCard({
  displayName,
  username,
  avatarUrl,
  isVerified,
  videoCount,
  className,
}: ProfileCardProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
        {avatarUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col truncate">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-base font-bold text-foreground">
            {displayName}
          </h3>
          {isVerified && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500 fill-blue-500/20" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">@{username}</span>

        {videoCount !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Video className="h-3.5 w-3.5" />
            <span>{formatNumber(videoCount)} Videos Tracked</span>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. StatCardsGrid Component (การ์ดรวม 5 ใบ ตามโครงสร้างที่ต้องการ)
// -------------------------------------------------------------
export interface ChannelOverviewData {
  profile: {
    displayName: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
    followers: number;
    likes: number;
    videoCount: number;
  };
  metrics: {
    totalViews: number;
    avgViewsPerVideo: number;
    totalLikes: number;
    avgEngagementRate: number;
  };
}

export function StatCardsGrid({ data }: { data: ChannelOverviewData }) {
  const { profile, metrics } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* 1. Profile */}
      <ProfileCard
        displayName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        isVerified={profile.isVerified}
        videoCount={profile.videoCount}
      />

      {/* 2. Followers */}
      <StatCard
        title="Followers"
        value={profile.followers}
        change={12.4}
        icon={Users}
      />

      {/* 3. Video Views (totalViews + avgViewsPerVideo) */}
      <StatCard
        title="Video Views"
        value={metrics.totalViews}
        subValue={`Avg. ${formatNumber(metrics.avgViewsPerVideo)} / video`}
        change={8.1}
        icon={Eye}
      />

      {/* 4. Likes */}
      <StatCard
        title="Likes"
        value={profile.likes || metrics.totalLikes}
        change={5.7}
        icon={Heart}
      />

      {/* 5. Engagement Rate */}
      <StatCard
        title="Engagement Rate"
        value={`${metrics.avgEngagementRate}%`}
        change={-0.4}
        icon={Percent}
      />
    </div>
  );
}

// Aliases & Default Export เพื่อความยืดหยุ่นในการ Import
export { StatCardsGrid as StatCards };
export default StatCardsGrid;
