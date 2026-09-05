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
  };
}

export function StatCardsGrid({ data }: { data: ChannelOverviewData }) {
  const { profile, metrics } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <ProfileCard
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2"
        displayName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        isVerified={profile.isVerified ?? true}
        category={profile.category}
        tags={profile.tags}
        profileUrl={profile.profileUrl}
        videoCount={profile.videoCount}
      />
      <FollowersCard
        followers={profile.followers}
        change={metrics.followersChange ?? 12.4}
        comparisonText={metrics.comparisonText}
      />
      <ViewsCard
        totalViews={metrics.totalViews}
        avgViews={metrics.avgViewsPerVideo}
        change={metrics.viewsChange ?? 8.1}
        comparisonText={metrics.comparisonText}
      />
      <LikesCard
        likes={profile.likes || metrics.totalLikes}
        change={metrics.likesChange ?? 5.7}
        comparisonText={metrics.comparisonText}
      />
      <EngagementCard
        rate={metrics.avgEngagementRate}
        change={metrics.engagementChange ?? -0.4}
        comparisonText={metrics.comparisonText}
      />
    </div>
  );
}


