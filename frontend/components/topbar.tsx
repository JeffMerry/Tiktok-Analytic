"use client";

import { ReactNode } from "react";
import { Music2 } from "lucide-react";

interface TopbarProps {
  // Left side content (Title, Subtitle, Search bar, etc.)
  children?: ReactNode;
  // Right side content (Filter buttons, actions, etc.)
  rightContent?: ReactNode;
}

export function Topbar({ children, rightContent }: TopbarProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background lg:hidden">
          <Music2 className="h-4 w-4" />
        </div>
        {children}
      </div>

      {/* Right side */}
      {rightContent && (
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      )}
    </header>
  );
}
