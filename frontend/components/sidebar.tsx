"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  Video,
  Users,
  DollarSign,
  Settings,
  Music2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", icon: LayoutGrid, href: "/" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Content", icon: Video, href: "/videos" },
  { label: "Audience", icon: Users, href: "#" },
  { label: "Earnings", icon: DollarSign, href: "#" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
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
        {nav.map((item) => {
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
          "flex items-center rounded-lg text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground",
          isCollapsed
            ? "h-10 w-10 mx-auto justify-center px-0"
            : "gap-3 px-3 py-2"
        )}
      >
        <Settings className="h-[18px] w-[18px] shrink-0" />
        {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
      </button>
    </aside>
  );
}

