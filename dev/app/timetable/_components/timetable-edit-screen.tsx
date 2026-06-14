"use client";

import Link from "next/link";
import { GripVertical, Lock, Plus, Star } from "lucide-react";
import { useState } from "react";
import { AppBar, Button, Card, Modal, Stepper } from "@/components/ui";
import { BackButton, InfoRow } from "../../_components/buddy-patterns";
import { calculateTimetableLoad, getModeLabel, timetableStops, type TimetableStop } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TimetableEditScreen({ showWarning = false }: { showWarning?: boolean }) {
  const [stops, setStops] = useState<TimetableStop[]>(timetableStops);
  const [extra, setExtra] = useState(showWarning ? 42 : 0);
  const load = calculateTimetableLoad(stops, extra);
  const updateStopMinutes = (id: string, field: "dwellMinutes" | "transitMinutes", delta: number) => {
    setStops((current) =>
      current.map((stop) =>
        stop.id === id ? { ...stop, [field]: Math.max(field === "dwellMinutes" ? 10 : 0, stop[field] + delta) } : stop
      )
    );
  };

  return (
    <>
      <AppBar
        title="일정표 편집"
        left={<BackButton href="/timeline" icon="close" />}
        right={<Link href="/timeline" className="text-[13px] font-semibold text-[var(--cb-yellow)]">저장</Link>}
      />
      <div className="px-4 py-3">
        <div className="text-[13px] font-bold">2026.06.15 (월) - D-Day</div>
        <div className="text-[11px] text-[var(--cb-text-3)]">드래그 핸들 · 체류 시간 · 이동 수단</div>
      </div>
      <div className="body-scroll">
        <div className="space-y-2">
          {stops.map((stop) => (
            <div key={stop.id}>
              <Card className={cn("p-0", stop.locked && "border-[var(--cb-yellow-line)]")}>
                <div className="flex items-center gap-2 p-3">
                  <GripVertical size={16} className="text-[var(--cb-text-3)]" />
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--cb-yellow)] text-[12px] font-black text-[var(--cb-on-yellow)]">
                    {stop.locked ? <Star size={14} fill="currentColor" /> : stop.id.replace("s", "")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold">
                      {stop.place} {stop.locked ? <Lock className="inline" size={13} /> : null}
                    </div>
                    <div className="text-[11px] text-[var(--cb-text-3)]">{stop.time}</div>
                  </div>
                  <Stepper
                    value={`${stop.dwellMinutes}분`}
                    onMinus={() => updateStopMinutes(stop.id, "dwellMinutes", -10)}
                    onPlus={() => updateStopMinutes(stop.id, "dwellMinutes", 10)}
                  />
                </div>
              </Card>
              {stop.transitMinutes > 0 ? (
                <div className="mx-4 my-1 flex items-center justify-between rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3 py-2 text-[12px] text-[var(--cb-text-2)]">
                  <span>{getModeLabel(stop.mode)} 이동</span>
                  <Stepper
                    value={`${stop.transitMinutes}분`}
                    onMinus={() => updateStopMinutes(stop.id, "transitMinutes", -5)}
                    onPlus={() => updateStopMinutes(stop.id, "transitMinutes", 5)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <Link href="/places" className="mt-3 block">
          <Button variant="outline">
            <Plus size={18} /> 장소 추가
          </Button>
        </Link>
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] p-4">
        <div className="mb-2 text-[11px] text-[var(--cb-text-3)]">
          총 소요 {load.usedMinutes}분 · 사용 가능 {load.availableMinutes}분
        </div>
        <Link href={load.isOverTime ? "/timetable?modal=warning" : "/timeline"} onClick={() => setExtra(42)}>
          <Button>수정 완료</Button>
        </Link>
      </div>
      {showWarning ? <OverTimeModal load={load} /> : null}
    </>
  );
}

function OverTimeModal({ load }: { load: ReturnType<typeof calculateTimetableLoad> }) {
  return (
    <Modal title="지금 일정을 전부 소화할 수 없습니다" position="center" onClose={() => undefined}>
      <div className="rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3 text-[12px]">
        <InfoRow label="사용 가능 시간" value="14:00 - 18:30 · 4h 30m" />
        <InfoRow label="현재 일정 총 소요" value={`${load.usedMinutes}분`} />
        <InfoRow label="초과 시간" value={`+ ${load.overMinutes}분`} strong />
      </div>
      <p className="mt-3 text-[12px] leading-5 text-[var(--cb-text-2)]">장소를 줄이거나 체류 시간을 줄여 주세요. 저장은 차단됩니다.</p>
      <Link href="/timetable" className="mt-4 block">
        <Button>되돌아가서 수정</Button>
      </Link>
    </Modal>
  );
}
