"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { AppBar, Button } from "@/components/ui";
import { BackButton, TimelineBlock } from "../../_components/buddy-patterns";
import { timetableStops } from "@/lib/data";

export function TimelineScreen() {
  return (
    <>
      <AppBar
        title="타임라인"
        left={<BackButton href="/my-rooms" />}
        right={
          <Link href="/map">
            <Button size="icon" variant="outline" aria-label="지도 미리보기">
              <MapPin size={18} />
            </Button>
          </Link>
        }
      />
      <div className="body-scroll">
        <div className="mb-3 flex items-center justify-between rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3">
          <div>
            <div className="text-[13px] font-bold">2026.06.15 (월)</div>
            <div className="text-[11px] text-[var(--cb-text-3)]">공연 시작 19:00 기준 자동 역산</div>
          </div>
          <Link href="/timetable" className="text-[12px] font-bold text-[var(--cb-yellow)]">
            편집
          </Link>
        </div>
        <TimelineBlock stops={timetableStops} detailed />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link href="/timetable">
            <Button variant="outline" size="sm">일정 수정</Button>
          </Link>
          <Link href="/map">
            <Button variant="outline" size="sm">지도</Button>
          </Link>
          <Link href="/memories">
            <Button variant="outline" size="sm">추억</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
