"use client";

import { usePathname, useRouter } from "next/navigation";
import { ListIcon, SignOutIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/foundations/ui/avatar/avatar";
import { Button, IconButton } from "@/foundations/ui/button/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/months": "Monthly budgets",
  "/projects": "Projects",
  "/insights": "Insights",
  "/export": "Export data",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.match(/\/months\/[^/]+/)) return "Month details";
  return "Budget Tracker";
}

interface HeaderProps {
  userEmail?: string;
  onOpenMenu: () => void;
}

export function Header({ userEmail, onOpenMenu }: HeaderProps) {
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
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="flex min-h-14 items-center gap-2 px-3 sm:px-4">
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={onOpenMenu}
        >
          <ListIcon className="size-5" />
        </IconButton>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
        {userEmail ? (
          <span className="hidden max-w-56 truncate text-sm text-foreground-secondary lg:block">
            {userEmail}
          </span>
        ) : null}
        <Avatar size="sm" className="bg-accent text-accent-foreground" aria-label={userEmail ?? "Account"}>
          <Avatar.Fallback>{userEmail?.[0]?.toUpperCase() ?? "U"}</Avatar.Fallback>
        </Avatar>
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          className="sm:hidden"
          aria-label="Sign out"
          onClick={handleSignOut}
        >
          <SignOutIcon className="size-5" />
        </IconButton>
        <Button type="button" variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={handleSignOut}>
          <SignOutIcon className="size-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
