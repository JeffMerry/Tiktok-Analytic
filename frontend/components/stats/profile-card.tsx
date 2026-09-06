"use client";

import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileCardProps {
  displayName?: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  category?: string;
  tags?: string;
  profileUrl?: string;
  videoCount?: number;
  className?: string;
}

export function ProfileCard({
  displayName,
  username,
  avatarUrl,
  isVerified = true,
  category = "Content Creator",
  tags = "Lifestyle • Tips • Aesthetic",
  profileUrl,
  className,
}: ProfileCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const targetUrl = profileUrl || `https://www.tiktok.com/@${username}`;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#10131a] p-5 sm:p-6 shadow-xl transition-all hover:border-zinc-700/90",
        className
      )}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Large Avatar with Teal Ring & Glow */}
        <div className="relative shrink-0 p-[3px] rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 shadow-lg shadow-teal-500/20">
          <div className="h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-full bg-secondary flex items-center justify-center border-2 border-background">
            {avatarUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={username}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {(displayName || username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-1 flex-col min-w-0">
          {displayName && (
            <span className="text-xs text-muted-foreground/80 font-medium truncate">
              {displayName}
            </span>
          )}
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate text-base sm:text-lg font-bold text-foreground tracking-tight">
              @{username}
            </span>
            {isVerified && (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 fill-teal-400 text-card" />
            )}
          </div>

          <span className="mt-1 text-xs sm:text-sm text-teal-400/90 font-medium">
            {category}
          </span>

          <span className="mt-0.5 text-xs text-muted-foreground/70 truncate">
            {tags}
          </span>
        </div>
      </div>

      {/* View profile button */}
      <div className="mt-4 sm:mt-5 pt-1">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-secondary/90 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary hover:text-white transition-all border border-border/50 shadow-sm"
        >
          View profile
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </div>
    </div>
  );
}


