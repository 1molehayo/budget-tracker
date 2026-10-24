"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarBlankIcon,
  ChartBarIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  HouseIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/classnames";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HouseIcon },
  { name: "Months", href: "/months", icon: CalendarBlankIcon },
  { name: "Projects", href: "/projects", icon: ClipboardTextIcon },
  { name: "Insights", href: "/insights", icon: ChartBarIcon },
  { name: "Export", href: "/export", icon: DownloadSimpleIcon },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-dvh flex-col bg-linear-to-b from-sidebar via-sidebar-mid to-sidebar text-white">
      <div className="border-b border-white/15 px-4 py-4">
        <p className="text-sm font-semibold">Budget Tracker</p>
        <p className="text-xs text-sidebar-muted">Household finance</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-sidebar-muted hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  isActive ? "text-mark" : "text-sidebar-icon",
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">{item.name}</span>
              {isActive ? (
                <span
                  className="size-1.5 rounded-full bg-chart-income"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/15 p-3">
        <Link
          href="/months"
          onClick={onNavigate}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-chart-income to-teal px-3 text-sm font-medium text-white"
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          Manage months
        </Link>
      </div>
    </div>
  );
}
