"use client";

import React, { useState, useMemo } from "react";
import { LayoutGrid, Info } from "lucide-react";

export interface HeatmapDayRow {
  dayIndex: number;
  dayName: string;
  dayNameTH: string;
  dayShortTH: string;
  dateLabel?: string;
  hours: Array<{
    hour: number;
    label: string;
    views: number;
    engagement: number;
    videoCount: number;
    intensity: number;
  }>;
}

interface TimeSlotsHeatmapCardProps {
  data?: HeatmapDayRow[];
}

function getHeatmapColor(intensity: number): string {
  if (intensity <= 0) return "#121927"; // Empty Dark Blue
  if (intensity < 0.15) return "#1e3050";
  if (intensity < 0.3) return "#1d4ed8"; // Royal Blue
  if (intensity < 0.45) return "#0284c7"; // Sky Blue
  if (intensity < 0.6) return "#06b6d4"; // Cyan
  if (intensity < 0.75) return "#10b981"; // Emerald
  if (intensity < 0.88) return "#a3e635"; // Lime
  return "#facc15"; // Peak Yellow
}

export function TimeSlotsHeatmapCard({ data }: TimeSlotsHeatmapCardProps) {
  const [metricFilter, setMetricFilter] = useState("views");
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: string;
    views: number;
    er: number;
    count: number;
  } | null>(null);

  // Demo fallback rows if DB matrix is empty
  const rows: HeatmapDayRow[] = useMemo(() => {
    if (data && data.length > 0 && data.some((r) => r.hours.some((h) => h.views > 0))) {
      return data;
    }

    const days = [
      { name: "จันทร์", date: "23 มิ.ย." },
      { name: "อังคาร", date: "24 มิ.ย." },
      { name: "พุธ", date: "25 มิ.ย." },
      { name: "พฤหัสบดี", date: "26 มิ.ย." },
      { name: "ศุกร์", date: "27 มิ.ย." },
      { name: "เสาร์", date: "28 มิ.ย." },
      { name: "อาทิตย์", date: "29 มิ.ย." },
    ];

    // Heatmap curve distribution with peak evening hours (17:00 - 21:00)
    return days.map((d, dIdx) => {
      const dayFactor = [0.8, 0.75, 1.0, 0.9, 0.85, 0.7, 0.6][dIdx];
      const hours = Array.from({ length: 24 }, (_, h) => {
        let hourBase = 0.05;
        if (h >= 7 && h <= 11) hourBase = 0.35;
        else if (h >= 12 && h <= 16) hourBase = 0.55;
        else if (h >= 17 && h <= 21) hourBase = 0.95;
        else if (h >= 22) hourBase = 0.4;

        const noise = ((h * 7 + dIdx * 13) % 15) / 100;
        const intensity = Math.min(Math.max(Number((hourBase * dayFactor + noise).toFixed(2)), 0), 1);
        const views = Math.round(intensity * 15_000_000);

        return {
          hour: h,
          label: `${h.toString().padStart(2, "0")}:00`,
          views,
          engagement: Number((4.5 + intensity * 4).toFixed(1)),
          videoCount: 5,
          intensity,
        };
      });

      return {
        dayIndex: dIdx,
        dayName: d.name,
        dayNameTH: `วัน${d.name}`,
        dayShortTH: d.name,
        dateLabel: d.date,
        hours,
      };
    });
  }, [data]);

  return (
    <div className="w-full bg-[#10131a] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 text-zinc-100 shadow-xl overflow-hidden flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Heatmap สถิติช่วงเวลาทั้งหมด
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              แสดงความหนาแน่นของยอดวิวในแต่ละวันและช่วงเวลา
            </p>
          </div>
        </div>

        {/* Legend & Filter Controls */}
        <div className="flex items-center gap-4 flex-wrap self-start lg:self-auto text-xs">
          {/* Color Scale Legend */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">น้อย</span>
            <div className="w-28 h-2.5 rounded-full bg-gradient-to-r from-[#1d4ed8] via-[#06b6d4] via-[#10b981] to-[#facc15] shadow-sm" />
            <span className="text-[11px] text-zinc-300 font-semibold">มาก</span>
          </div>

          {/* Metric Selector */}
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-1.5 font-medium outline-none cursor-pointer"
          >
            <option value="views">ยอดวิว</option>
            <option value="engagement">การมีส่วนร่วม</option>
          </select>

          {/* Period Selector */}
          <select
            className="bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-1.5 font-medium outline-none cursor-pointer"
          >
            <option>30 วันล่าสุด</option>
            <option>7 วันล่าสุด</option>
            <option>90 วันล่าสุด</option>
          </select>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Table Header: Hour Numbers (00 - 23) */}
          <div className="grid grid-cols-[90px_repeat(24,1fr)] gap-1 mb-1.5 text-center text-[10.5px] font-medium text-zinc-400">
            <div className="text-left pl-2 font-semibold text-zinc-400">วัน / เวลา</div>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={`h-head-${h}`} className="truncate">
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* Table Body: 7 Days Rows */}
          <div className="space-y-1">
            {rows.map((row, rIdx) => (
              <div
                key={`row-${rIdx}`}
                className="grid grid-cols-[90px_repeat(24,1fr)] gap-1 items-center"
              >
                {/* Day Header Label */}
                <div className="flex items-center justify-between pr-2 text-xs font-semibold text-zinc-200 select-none">
                  <span>{row.dayShortTH}</span>
                  {row.dateLabel && (
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {row.dateLabel}
                    </span>
                  )}
                </div>

                {/* 24 Hour Color Cells */}
                {row.hours.map((cell, cIdx) => {
                  const cellColor = getHeatmapColor(cell.intensity);
                  return (
                    <div
                      key={`cell-${rIdx}-${cIdx}`}
                      onMouseEnter={() =>
                        setHoveredCell({
                          day: row.dayShortTH,
                          hour: cell.label,
                          views: cell.views,
                          er: cell.engagement,
                          count: cell.videoCount,
                        })
                      }
                      style={{ backgroundColor: cellColor }}
                      className="h-7 sm:h-8 rounded-md cursor-pointer transition-colors duration-75 hover:brightness-130 hover:ring-2 hover:ring-white/90 shadow-sm"
                      title={`วัน${row.dayShortTH} เวลา ${cell.label} น. • ${cell.views.toLocaleString()} Views`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permanent Fixed-Height Status Footer (No Layout Shift) */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 min-h-[44px] flex items-center justify-between text-xs text-zinc-300">
        {hoveredCell ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 transition-all">
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400">วัน{hoveredCell.day}</span>
              <span className="text-zinc-200">ช่วงเวลา {hoveredCell.hour} น.</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400">
              <span>
                ยอดวิวเฉลี่ย:{" "}
                <strong className="text-white font-bold">
                  {hoveredCell.views.toLocaleString()}
                </strong>
              </span>
              <span>
                ER:{" "}
                <strong className="text-purple-400 font-bold">
                  {hoveredCell.er}%
                </strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400 text-[11.5px]">
            <Info className="w-3.5 h-3.5 text-zinc-400" />
            <span>เลื่อนเมาส์ไปชี้ที่ช่องเวลาเพื่อดูสถิติยอดวิวและอัตราการมีส่วนร่วมอย่างละเอียด</span>
          </div>
        )}
      </div>
    </div>
  );
}
