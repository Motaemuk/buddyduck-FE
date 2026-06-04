"use client";

import { Wifi, Signal, BatteryFull } from "lucide-react";
import { BottomNav } from "./ui";
import type { AppScreen } from "@/lib/routes";

export function MobileShell({
  screen,
  children,
  showNav = true
}: {
  screen: AppScreen;
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <main className="app-stage">
      <div className="device">
        <div className="screen">
          <div className="notch" />
          <div className="statusbar">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <Signal size={16} />
              <Wifi size={16} />
              <BatteryFull size={18} />
            </span>
          </div>
          {children}
          {showNav ? <BottomNav active={screen.nav} /> : null}
        </div>
      </div>
    </main>
  );
}
