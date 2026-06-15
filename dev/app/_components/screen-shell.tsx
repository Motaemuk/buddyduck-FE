"use client";

import type { AppScreen } from "../_lib/routes";
import { MobileShell } from "./mobile-shell";

const SCREEN_IDS_WITHOUT_NAV = new Set([
  "CB-01",
  "CB-02",
  "CB-05",
  "CB-07A",
  "CB-07B",
  "CB-07C",
  "CB-07D",
  "CB-07Dprime",
  "CB-08",
  "CB-09",
  "CB-10",
  "CB-11",
  "CB-11prime",
  "CB-12",
  "CB-14prime"
]);

export function ScreenShell({ screen, children }: { screen: AppScreen; children: React.ReactNode }) {
  const showNav = Boolean(screen.nav) && !SCREEN_IDS_WITHOUT_NAV.has(screen.id);

  return (
    <MobileShell nav={screen.nav} showNav={showNav}>
      {children}
    </MobileShell>
  );
}
