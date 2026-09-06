"use client";

import React from "react";
import { CheckCircle2, Film, Calendar, Clock, RotateCw, Check } from "lucide-react";
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
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  lastUpdated?: Date | null;
  isRefreshing?: boolean;
  refreshSuccess?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function ProfileCard({
  displayName,
  username,
  avatarUrl,
  isVerified = true,
  category = "รีวิวของกิน | 24 ชั่วโมง | ไลฟ์สไตล์",
  videoCount = 142,
  selectedPeriod = "30d",
  onPeriodChange,
  lastUpdated,
  isRefreshing = false,
  refreshSuccess = false,
  onRefresh,
  className,
}: ProfileCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const periods = [
    { key: "7d", label: "7 วัน" },
    { key: "30d", label: "30 วัน" },
    { key: "90d", label: "90 วัน" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-2xl border border-zinc-800/80 bg-[#10131a] p-5 sm:p-6 shadow-xl transition-all hover:border-zinc-700/90",
        className
      )}
    >
      {/* Left: Avatar & Channel Details */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        {/* Large Avatar */}
        <div className="relative shrink-0 p-[2.5px] rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 shadow-md shadow-blue-500/20">
          <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-zinc-900 flex items-center justify-center border-2 border-[#10131a]">
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
              <span className="text-xl sm:text-2xl font-bold text-white">
                {(displayName || username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {displayName || username}
            </h2>
            {isVerified && (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 fill-blue-500 text-[#10131a]" />
            )}
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            @{username}
          </span>

          <p className="text-xs text-zinc-300 font-medium pt-0.5">
            {category}
          </p>

          {/* Sub Metadata Row */}
          <div className="flex items-center gap-4 pt-1 text-[11.5px] text-zinc-400 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-zinc-400" />
              คลิปทั้งหมด {videoCount.toLocaleString()} คลิป
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              เริ่มติดตามในระบบแล้ว
            </span>
          </div>
        </div>
      </div>

      {/* Right: Period Switcher + Divider + Live Badge + Refresh Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:justify-end shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800/60">
        {/* Period Pills Switcher + Calendar */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-xl">
          {periods.map((p) => {
            const isActive = selectedPeriod === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onPeriodChange?.(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {p.label}
              </button>
            );
          })}
          
          {/* Calendar Icon Button */}
          <button
            title="เลือกช่วงเวลาแบบกำหนดเอง"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden 2xl:block h-6 w-px bg-zinc-800/80" />

        {/* Live Status Badge */}
        {lastUpdated && (
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              ข้อมูลล่าสุด ({lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.)
            </span>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {refreshSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>อัปเดตแล้ว</span>
              </>
            ) : (
              <>
                <RotateCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>{isRefreshing ? "กำลังอัปเดต..." : "อัปเดตข้อมูลล่าสุด"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
