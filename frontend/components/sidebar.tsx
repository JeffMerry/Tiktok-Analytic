"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Calendar,
  BarChart3,
  Video,
  Users,
  DollarSign,
  Settings,
  Music2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { label: "Overview", icon: LayoutGrid, href: "/" },
  { label: "Calendar", icon: Calendar, href: "/calendar" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Content", icon: Video, href: "/videos" },
  { label: "Audience", icon: Users, href: "#" },
  { label: "Earnings", icon: DollarSign, href: "#" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 1. Desktop / Laptop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-card py-5 transition-all duration-300 ease-in-out lg:flex",
          isCollapsed ? "w-16 px-2" : "w-60 px-3"
        )}
      >
        {/* Header & Logo */}
        <div
          className={cn(
            "flex items-center pb-6 min-h-[48px]",
            isCollapsed ? "justify-center" : "justify-between px-2"
          )}
        >
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <Music2 className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight whitespace-nowrap">
                TikTok Analytic
              </span>
            </Link>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground cursor-pointer"
            title={isCollapsed ? "ขยาย Sidebar" : "พับเก็บ Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all",
                  isCollapsed
                    ? "h-10 w-10 mx-auto justify-center px-0"
                    : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Settings Button */}
        <button
          title={isCollapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground cursor-pointer",
            isCollapsed
              ? "h-10 w-10 mx-auto justify-center px-0"
              : "gap-3 px-3 py-2"
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </button>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar (สำหรับหน้าจอ < 1024px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#10131a]/95 backdrop-blur-lg border-t border-zinc-800/90 px-3 py-2 shadow-2xl">
        <nav className="flex items-center justify-around">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-semibold transition-all",
                  isActive
                    ? "text-cyan-400 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-110 text-cyan-400 stroke-[2.5]" : "text-zinc-400"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile More Button (เปิด Drawer เมนูเต็ม) */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* 3. Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-[#10141e] border-r border-zinc-800 h-full p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                    <Music2 className="h-4 w-4" />
                  </div>
                  <span className="text-base font-bold text-white tracking-tight">
                    TikTok Analytic
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links in Drawer */}
              <nav className="flex flex-col gap-1.5 pt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-600/20 text-cyan-400 border border-cyan-500/30 font-bold"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-zinc-800">
              <button className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
