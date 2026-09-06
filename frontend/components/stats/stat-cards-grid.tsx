"use client";

import { ProfileCard } from "./profile-card";
import { FollowersCard } from "./followers-card";
import { ViewsCard } from "./views-card";
import { LikesCard } from "./likes-card";
import { EngagementCard } from "./engagement-card";

export interface ChannelOverviewData {
  profile: {
    displayName?: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
    followers: number;
    likes: number;
    videoCount?: number;
    category?: string;
    tags?: string;
    profileUrl?: string;
  };
  metrics: {
    totalViews: number;
    avgViewsPerVideo?: number;
    totalLikes: number;
    totalComments?: number;
    totalShares?: number;
    totalVideosTracked?: number;
    avgEngagementRate: number;
    followersChange?: number;
    viewsChange?: number;
    likesChange?: number;
    engagementChange?: number;
    comparisonText?: string;
    followersSparkline?: number[];
    likesSparkline?: number[];
    viewsSparkline?: number[];
    engagementSparkline?: number[];
  };
}

export function StatCardsGrid({ data }: { data: ChannelOverviewData }) {
  const { profile, metrics } = data;

  return (
    <div className="space-y-4">
      {/* 1. Channel Profile Banner */}
      <ProfileCard
        displayName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        isVerified={profile.isVerified ?? true}
        category={profile.category}
        tags={profile.tags}
        profileUrl={profile.profileUrl}
        videoCount={profile.videoCount}
      />

      {/* 2. 4-Column Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FollowersCard
          followers={profile.followers}
          change={metrics.followersChange ?? 0}
          comparisonText={metrics.comparisonText ?? "ยอดสะสมปัจจุบัน"}
          sparklineData={metrics.followersSparkline}
        />
        <ViewsCard
          totalViews={metrics.totalViews}
          avgViews={metrics.avgViewsPerVideo}
          change={metrics.viewsChange ?? 0}
          comparisonText={metrics.comparisonText ?? "ยอดสะสมปัจจุบัน"}
          sparklineData={metrics.viewsSparkline}
        />
        <LikesCard
          likes={profile.likes || metrics.totalLikes}
          change={metrics.likesChange ?? 0}
          comparisonText={metrics.comparisonText ?? "ยอดสะสมปัจจุบัน"}
          sparklineData={metrics.likesSparkline}
        />
        <EngagementCard
          rate={metrics.avgEngagementRate}
          change={metrics.engagementChange ?? 0}
          comparisonText={metrics.comparisonText ?? "ยอดสะสมปัจจุบัน"}
          sparklineData={metrics.engagementSparkline}
        />
      </div>
    </div>
  );
}


