"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "@/foundations/ui/drawer/drawer";
import { Toaster } from "@/foundations/ui/toaster/toaster";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-dvh bg-background-secondary md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="hidden border-r border-border bg-background md:block">
        <Sidebar />
      </div>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <Drawer.Content side="left" className="max-w-xs bg-background p-0 md:hidden">
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </Drawer.Content>
      </Drawer>
      <div className="flex min-w-0 flex-col">
        <Header userEmail={email} onOpenMenu={() => setMenuOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
