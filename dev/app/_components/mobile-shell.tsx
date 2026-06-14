"use client";

import { BottomNav, type BottomNavActive } from "@/components/ui";

export function AppShell({
  nav,
  children,
  showNav = true
}: {
  nav?: BottomNavActive;
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <main className="app-stage">
      <div className="screen">
        {children}
        {showNav ? <BottomNav active={nav} /> : null}
      </div>
    </main>
  );
}

export const MobileShell = AppShell;
