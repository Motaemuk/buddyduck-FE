"use client";

import type { AppScreen } from "../_lib/routes";
import { MobileShell } from "./mobile-shell";

const SCREEN_IDS_WITHOUT_NAV = new Set(["CB-01", "CB-02", "CB-05", "CB-14prime"]);

export function ScreenShell({ screen, children }: { screen: AppScreen; children: React.ReactNode }) {
  const showNav = Boolean(screen.nav) && !SCREEN_IDS_WITHOUT_NAV.has(screen.id);

  return (
    <MobileShell nav={screen.nav} showNav={showNav}>
      {children}
    </MobileShell>
  );
}
