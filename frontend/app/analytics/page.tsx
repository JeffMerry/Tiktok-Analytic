"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { BestTimeCard, BestTimeData } from "@/components/best-time-card";

export default function AnalyticsPage() {
  const [bestTimeData, setBestTimeData] = useState<BestTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBestTime() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5000/api/analytics/best-time/jjayallday");
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูล Best Time to Post ได้");
        const json = await res.json();
        if (json.data) {
          setBestTimeData(json.data);
        } else {
          throw new Error(json.message || "ไม่พบข้อมูลสถิติ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    fetchBestTime();
  }, []);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Analytics Deep Dive
              </h1>
              <p className="text-xs text-zinc-400">
                Detailed performance metrics, best posting schedules, and insights.
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              กำลังวิเคราะห์ช่วงเวลาที่เหมาะสมที่สุด...
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          {!loading && !error && bestTimeData && (
            <BestTimeCard data={bestTimeData} />
          )}
        </main>
      </div>
    </div>
  );
}
