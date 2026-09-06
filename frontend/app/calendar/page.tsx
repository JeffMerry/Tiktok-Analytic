"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Play,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Sparkles,
  Clock,
  Loader2,
  Video,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { getCalendarData, CalendarVideoItem, YearMonthStat } from "@/src/services/api";

function TikTokIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <div className="w-5 h-5 rounded-md bg-zinc-950/90 border border-zinc-700/60 flex items-center justify-center shrink-0 shadow-sm">
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path
          fill="#22d3ee"
          d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.892 2.893 2.895 2.895 0 0 1-2.892-2.893 2.895 2.895 0 0 1 2.892-2.892c.38 0 .739.074 1.069.208V9.45a6.31 6.31 0 0 0-1.069-.092A6.338 6.338 0 0 0 3 15.672 6.338 6.338 0 0 0 9.351 22a6.338 6.338 0 0 0 6.339-6.328V9.117a8.214 8.214 0 0 0 4.61 1.403v-3.45a4.767 4.767 0 0 1-.711-.384z"
        />
        <path
          fill="#f43f5e"
          d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.892 2.893 2.895 2.895 0 0 1-2.892-2.893 2.895 2.895 0 0 1 2.892-2.892c.38 0 .739.074 1.069.208V9.45a6.31 6.31 0 0 0-1.069-.092A6.338 6.338 0 0 0 3 15.672 6.338 6.338 0 0 0 9.351 22a6.338 6.338 0 0 0 6.339-6.328V9.117a8.214 8.214 0 0 0 4.61 1.403v-3.45a4.767 4.767 0 0 1-.711-.384z"
          opacity="0.8"
        />
        <path
          fill="#ffffff"
          d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.892 2.893 2.895 2.895 0 0 1-2.892-2.893 2.895 2.895 0 0 1 2.892-2.892c.38 0 .739.074 1.069.208V9.45a6.31 6.31 0 0 0-1.069-.092A6.338 6.338 0 0 0 3 15.672 6.338 6.338 0 0 0 9.351 22a6.338 6.338 0 0 0 6.339-6.328V9.117a8.214 8.214 0 0 0 4.61 1.403v-3.45a4.767 4.767 0 0 1-.711-.384z"
        />
      </svg>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"Year" | "Month" | "Week">("Month");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());

  // Data states
  const [videos, setVideos] = useState<CalendarVideoItem[]>([]);
  const [yearMonthlyStats, setYearMonthlyStats] = useState<YearMonthStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hours = [
    "08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM",
    "04:00 PM", "06:00 PM", "08:00 PM", "10:00 PM"
  ];

  // Fetch Calendar Data from Backend
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await getCalendarData("jjayallday", activeYear, activeMonthIndex + 1);
        if (isMounted && res && res.data) {
          const vids = res.data.videos || [];
          setVideos(vids);
          if (res.data.yearMonthlyStats) {
            setYearMonthlyStats(res.data.yearMonthlyStats);
          }
          // If in month view and current selectedDay has no videos but others do, default smoothly
          if (vids.length > 0 && !vids.some((v) => v.post_day === selectedDay)) {
            setSelectedDay(vids[0].post_day);
          }
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeYear, activeMonthIndex]);

  // Group videos by day of the month (1 - 31)
  const videosByDay = useMemo(() => {
    const map: Record<number, CalendarVideoItem[]> = {};
    videos.forEach((v) => {
      const day = v.post_day;
      if (!map[day]) map[day] = [];
      map[day].push(v);
    });
    return map;
  }, [videos]);

  // Dynamic month days calculation
  const totalDaysInMonth = new Date(activeYear, activeMonthIndex + 1, 0).getDate();
  const firstDayWeekday = new Date(activeYear, activeMonthIndex, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const prevMonthTotalDays = new Date(activeYear, activeMonthIndex, 0).getDate();

  // 35 or 42 grid cells
  const totalCells = firstDayWeekday + totalDaysInMonth > 35 ? 42 : 35;
  const calendarCells = Array.from({ length: totalCells }, (_, idx) => {
    const dayNum = idx - firstDayWeekday + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= totalDaysInMonth;
    const displayNum = isCurrentMonth
      ? dayNum
      : dayNum < 1
      ? prevMonthTotalDays + dayNum
      : dayNum - totalDaysInMonth;

    const dayVideos = isCurrentMonth ? videosByDay[dayNum] || [] : [];

    return {
      cellIndex: idx,
      dayNum,
      displayNum,
      isCurrentMonth,
      videos: dayVideos,
    };
  });

  // Selected Day vs Selected Month videos and metrics
  const selectedDayVideos = videosByDay[selectedDay] || [];
  const selectedDayTotalViews = selectedDayVideos.reduce((sum, v) => sum + Number(v.views), 0);
  const selectedDayTotalLikes = selectedDayVideos.reduce((sum, v) => sum + Number(v.likes), 0);

  // Month overview stats for Year mode
  const monthTotalViews = videos.reduce((sum, v) => sum + Number(v.views), 0);
  const monthTotalLikes = videos.reduce((sum, v) => sum + Number(v.likes), 0);

  // Active videos to display in inspector panel based on viewMode
  const activeInspectorVideos = viewMode === "Year" ? videos : selectedDayVideos;

  return (
    <div className="flex min-h-svh bg-[#0b0e14] text-zinc-100 font-sans">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-400" />
              Content Calendar
            </h1>
            <p className="text-xs text-zinc-400">
              วางแผนตารางคอนเทนต์ ติดตามและจัดการกำหนดเวลาเผยแพร่วิดีโอจริง
            </p>
          </div>
        </Topbar>

        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Full-Width Calendar Container */}
          <div className="w-full flex flex-col bg-[#10141e] border border-zinc-800/80 rounded-2xl p-5 sm:p-7 shadow-2xl overflow-hidden">
            {/* Calendar Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
              {/* Left: Navigation Header */}
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {viewMode === "Year"
                    ? `${activeYear}`
                    : viewMode === "Week"
                    ? `Week • ${months[activeMonthIndex]} ${activeYear}`
                    : `${months[activeMonthIndex]} ${activeYear}`}
                </h2>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => {
                      if (viewMode === "Year") {
                        setActiveYear((prev) => prev - 1);
                      } else {
                        if (activeMonthIndex === 0) {
                          setActiveMonthIndex(11);
                          setActiveYear((prev) => prev - 1);
                        } else {
                          setActiveMonthIndex((prev) => prev - 1);
                        }
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (viewMode === "Year") {
                        setActiveYear((prev) => prev + 1);
                      } else {
                        if (activeMonthIndex === 11) {
                          setActiveMonthIndex(0);
                          setActiveYear((prev) => prev + 1);
                        } else {
                          setActiveMonthIndex((prev) => prev + 1);
                        }
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    const now = new Date();
                    setActiveYear(now.getFullYear());
                    setActiveMonthIndex(now.getMonth());
                    setSelectedDay(now.getDate());
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
                >
                  Today
                </button>

                {loading && (
                  <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium ml-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังโหลดข้อมูล...
                  </span>
                )}
              </div>

              {/* Right: View Mode Switcher (Year | Month | Week) */}
              <div className="flex items-center bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
                {(["Year", "Month", "Week"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      viewMode === mode
                        ? "bg-[#0d9488]/30 text-teal-300 border border-[#14b8a6]/40 shadow-sm shadow-teal-500/20"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* View 1: YEAR VIEW (12 Months Grid Overview) */}
            {viewMode === "Year" && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-400">
                    แสดงภาพรวมจำนวนคลิปทั้ง 12 เดือน — คลิกเลือกเดือนเพื่อดูสถิติและคลิปด้านล่าง
                  </p>
                  <button
                    onClick={() => setViewMode("Month")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    เปิดมุมมองปฏิทินรายเดือน <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {months.map((m, idx) => {
                    const isSelectedMonth = idx === activeMonthIndex;
                    const monthStat = yearMonthlyStats.find((s) => s.month === idx + 1);
                    const count = monthStat ? monthStat.videoCount : isSelectedMonth ? videos.length : 0;
                    const activeDays = monthStat?.activeDays || [];

                    return (
                      <div
                        key={m}
                        onClick={() => setActiveMonthIndex(idx)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelectedMonth
                            ? "border-cyan-500/90 bg-[#121c29] ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/40"
                            : "border-zinc-800/80 bg-[#121620]/90 hover:border-zinc-700 hover:bg-[#161c28]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-sm font-bold ${
                              isSelectedMonth ? "text-cyan-300" : "text-white"
                            }`}
                          >
                            {m}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                              count > 0
                                ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                                : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}
                          >
                            {count > 0 ? `${count} คลิป` : "0 คลิป"}
                          </span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 28 }).map((_, dIdx) => {
                            const hasVideo =
                              activeDays.includes(dIdx + 1) ||
                              (isSelectedMonth && !!videosByDay[dIdx + 1]);

                            return (
                              <div
                                key={dIdx}
                                className={`h-3.5 rounded-sm transition-colors ${
                                  hasVideo
                                    ? "bg-cyan-500/70 shadow-[0_0_4px_rgba(6,182,212,0.5)]"
                                    : "bg-zinc-800/40"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View 2: MONTH VIEW (Full Calendar Grid with Real Videos) */}
            {viewMode === "Month" && (
              <div className="flex-1 flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-2.5 sm:gap-3.5 pt-4 pb-2 text-center text-xs font-semibold text-zinc-400">
                  {weekdays.map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Month Grid Cells (7 Columns) */}
                <div className="grid grid-cols-7 gap-2.5 sm:gap-3.5 flex-1 auto-rows-fr">
                  {calendarCells.map((cell) => {
                    const isSelected = cell.isCurrentMonth && cell.dayNum === selectedDay;

                    return (
                      <div
                        key={cell.cellIndex}
                        onClick={() => cell.isCurrentMonth && setSelectedDay(cell.dayNum)}
                        className={`group min-h-[110px] sm:min-h-[125px] rounded-xl border p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "border-cyan-500/90 bg-[#121c29] ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/40"
                            : cell.isCurrentMonth
                            ? "border-zinc-800/80 bg-[#121620]/90 hover:border-zinc-700 hover:bg-[#161c28]"
                            : "border-zinc-900/40 bg-zinc-950/20 opacity-30 cursor-default"
                        }`}
                      >
                        {/* Cell Header */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? "text-cyan-400 font-extrabold"
                                : cell.isCurrentMonth
                                ? "text-zinc-300"
                                : "text-zinc-600"
                            }`}
                          >
                            {cell.displayNum}
                          </span>
                          {cell.videos.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              {cell.videos.length}
                            </span>
                          )}
                        </div>

                        {/* Real Video Badges */}
                        {cell.isCurrentMonth && cell.videos.length > 0 ? (
                          <div className="space-y-1.5 my-1 flex-1">
                            {cell.videos.slice(0, 2).map((video) => (
                              <div
                                key={video.id}
                                className={`group/item flex items-center gap-1.5 p-1 rounded-lg border transition-all shadow-sm ${
                                  isSelected
                                    ? "bg-cyan-950/40 border-cyan-500/40"
                                    : "bg-zinc-900/95 border-zinc-800/90 hover:border-zinc-700"
                                }`}
                              >
                                <TikTokIcon className="w-3 h-3" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10.5px] font-medium text-zinc-200 truncate group-hover/item:text-cyan-300 leading-tight">
                                    {video.caption || "คลิป TikTok"}
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] mt-0.5">
                                    <span className="text-zinc-400 font-mono">
                                      {video.post_time}
                                    </span>
                                    <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                                      <Play className="w-2 h-2 fill-current" />
                                      {formatNumber(video.views)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : cell.isCurrentMonth ? (
                          <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[11px] text-zinc-500 hover:text-cyan-400 flex items-center gap-1 font-medium">
                              <Plus className="w-3.5 h-3.5" /> วางแผน
                            </span>
                          </div>
                        ) : null}

                        {/* More than 2 videos indicator */}
                        {cell.isCurrentMonth && cell.videos.length > 2 && (
                          <div className="pt-0.5">
                            <span className="text-[9.5px] text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                              +{cell.videos.length - 2} more
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View 3: WEEK VIEW (Hourly Timeline Schedule) */}
            {viewMode === "Week" && (
              <div className="flex-1 flex flex-col pt-4 overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-8 gap-2 pb-2 text-center text-xs font-semibold text-zinc-400 border-b border-zinc-800/60">
                    <div className="text-zinc-500 py-1">Time</div>
                    {weekdays.map((day, dIdx) => (
                      <div
                        key={day}
                        className={`py-1 rounded-lg ${
                          dIdx === 3 ? "text-cyan-400 font-bold bg-cyan-500/10" : ""
                        }`}
                      >
                        {day} {15 + dIdx}
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-zinc-800/40">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-8 gap-2 py-3 items-center">
                        <div className="text-[11px] font-mono text-zinc-500 text-center">
                          {hour}
                        </div>
                        {Array.from({ length: 7 }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            className="h-10 rounded-lg border border-dashed border-zinc-800/60 hover:border-cyan-500/50 hover:bg-zinc-900/60 transition-all flex items-center justify-center cursor-pointer group"
                          >
                            <Plus className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Selected Day / Month Inspector Panel (แสดงข้อมูลค้างไว้ด้านล่างตลอดเวลา) */}
          <div className="bg-[#10141e] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {viewMode === "Year" ? (
                      <>
                        วิดีโอที่เผยแพร่ประจำเดือน {months[activeMonthIndex]} {activeYear}
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {videos.length} คลิป
                        </span>
                      </>
                    ) : (
                      <>
                        วิดีโอที่เผยแพร่วันที่ {selectedDay} {months[activeMonthIndex]} {activeYear}
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {selectedDayVideos.length} คลิป
                        </span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {viewMode === "Year"
                      ? videos.length > 0
                        ? `รายละเอียดและสถิติวิดีโอทั้งหมดที่ปล่อยในเดือน ${months[activeMonthIndex]}`
                        : `ไม่มีประวัติการเผยแพร่วิดีโอในเดือน ${months[activeMonthIndex]}`
                      : selectedDayVideos.length > 0
                      ? "รายละเอียดและสถิติวิดีโอที่ปล่อยในวันที่เลือก"
                      : "ไม่มีประวัติการเผยแพร่วิดีโอในวันนี้"}
                  </p>
                </div>
              </div>

              {activeInspectorVideos.length > 0 && (
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
                    ยอดวิวรวม:{" "}
                    <span className="font-bold text-cyan-400">
                      {formatNumber(viewMode === "Year" ? monthTotalViews : selectedDayTotalViews)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
                    ยอดไลก์รวม:{" "}
                    <span className="font-bold text-rose-400">
                      {formatNumber(viewMode === "Year" ? monthTotalLikes : selectedDayTotalLikes)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Cards Grid */}
            {activeInspectorVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {activeInspectorVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex flex-col justify-between p-4 rounded-xl bg-[#121622] border border-zinc-800 hover:border-cyan-500/50 hover:bg-[#151b2a] transition-all space-y-3 group shadow-md"
                  >
                    <div className="flex gap-3">
                      {video.cover_url && (
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                          <Image
                            src={video.cover_url}
                            alt={video.caption}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                          {video.duration > 0 && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-zinc-300">
                              {video.duration}s
                            </span>
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                            <TikTokIcon className="w-3 h-3" />
                            <Clock className="w-3 h-3 text-cyan-400 ml-1" />
                            <span className="font-mono text-zinc-300">
                              วันที่ {video.post_day} • {video.post_time}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white leading-snug line-clamp-3 group-hover:text-cyan-200 transition-colors">
                            {video.caption || "ไม่มีแคปชัน"}
                          </p>
                        </div>

                        <a
                          href={`https://www.tiktok.com/@jjayallday/video/${video.video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 pt-2 transition-colors"
                        >
                          ดูคลิปบน TikTok <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Stats Metrics Mini Grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-800/60 text-center">
                      <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80">
                        <div className="text-[9px] text-zinc-400 flex items-center justify-center gap-0.5">
                          <Play className="w-2.5 h-2.5 text-cyan-400 fill-current" /> Views
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {formatNumber(video.views)}
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80">
                        <div className="text-[9px] text-zinc-400 flex items-center justify-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-current" /> Likes
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {formatNumber(video.likes)}
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80">
                        <div className="text-[9px] text-zinc-400 flex items-center justify-center gap-0.5">
                          <MessageCircle className="w-2.5 h-2.5 text-blue-400" /> Comm.
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {formatNumber(video.comments)}
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80">
                        <div className="text-[9px] text-zinc-400 flex items-center justify-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> ER %
                        </div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">
                          {video.engagement_rate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 space-y-2">
                <Video className="w-8 h-8 text-zinc-600" />
                <p className="text-xs text-zinc-400 font-medium">
                  {viewMode === "Year"
                    ? `ไม่มีวิดีโอที่เผยแพร่ในเดือน ${months[activeMonthIndex]} ${activeYear}`
                    : `ไม่มีวิดีโอที่เผยแพร่ในวันที่ ${selectedDay} ${months[activeMonthIndex]} ${activeYear}`}
                </p>
                <span className="text-[11px] text-zinc-600">
                  {viewMode === "Year"
                    ? "คลิกเลือกเดือนอื่นในการ์ดด้านบนเพื่อดูสถิติและคลิปของเดือนนั้น"
                    : "คลิกเลือกวันอื่นที่มีตัวเลข Badge บนปฏิทินเพื่อดูรายละเอียดคลิป"}
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
