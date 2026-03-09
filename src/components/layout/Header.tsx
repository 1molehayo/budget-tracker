"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/months": "Monthly Budgets",
  "/projects": "Projects",
  "/insights": "Insights",
  "/export": "Export Data",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.match(/\/months\/[^/]+/)) return "Month Details";
  return "Budget Tracker";
}

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getPageTitle(pathname);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          )}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {userEmail?.[0]?.toUpperCase() ?? "U"}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
