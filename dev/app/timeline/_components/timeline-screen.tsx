"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Edit3, Lock, Map, Star } from "lucide-react";
import { useCallback, useRef } from "react";
import { AppBar } from "@/components/ui";
import {
  BackButton,
  formatStopMinutes,
  getStopMarkerLabel,
  RouteMapCanvas
} from "../../_components/buddy-patterns";
import { getModeLabel, type TimelineDay, type TimetableStop } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function TimelineScreen() {
  const router = useRouter();
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const timelineStopsByDay = useAppStore((state) => state.timelineStopsByDay);
  const activeDay = useAppStore((state) => state.activeTimelineDay);
  const selectedStopId = useAppStore((state) => state.selectedStopId);
  const activeStopId = useAppStore((state) => state.activeStopId);
  const setActiveTimelineDay = useAppStore((state) => state.setActiveTimelineDay);
  const selectStoreStop = useAppStore((state) => state.selectStop);
  const hoverStop = useAppStore((state) => state.hoverStop);
  const currentStops = timelineStopsByDay[activeDay];
  const currentSelectedStopId = currentStops.some((stop) => stop.id === selectedStopId) ? selectedStopId : currentStops[0]?.id ?? "";

  const selectStop = useCallback((stopId: string, scroll = false) => {
    selectStoreStop(stopId);
    if (scroll) {
      cardRefs.current[stopId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectStoreStop]);

  const navigateToMap = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const transitionDocument = document as ViewTransitionDocument;
    if (!transitionDocument.startViewTransition) return;
    event.preventDefault();
    transitionDocument.startViewTransition(() => router.push("/map"));
  };

  const changeDay = useCallback((day: TimelineDay) => {
    setActiveTimelineDay(day);
  }, [setActiveTimelineDay]);

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AppBar
        title="2026.06.15 (월) D-3"
        left={<BackButton href="/my-rooms" />}
        right={
          <Link
            href="/map"
            aria-label="지도 열기"
            className="grid h-[38px] w-[38px] place-items-center rounded-full border border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text)] transition duration-150 hover:bg-[var(--cb-surface-3)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
            onClick={navigateToMap}
          >
            <span>
              <Map size={18} />
            </span>
          </Link>
        }
      />
      <RouteMapCanvas
        stops={currentStops}
        selectedStopId={currentSelectedStopId}
        activeStopId={activeStopId}
        activeDay={activeDay}
        onDayChange={changeDay}
        onSelectStop={(stopId) => selectStop(stopId, true)}
        onHoverStop={hoverStop}
        className="h-[184px] border-b border-[var(--cb-line)]"
      />
      <div className="flex shrink-0 items-center justify-between border-b border-t border-[var(--cb-line)] bg-[var(--cb-bg)] px-4 py-[13px]">
        <div className="flex items-center gap-1.5 text-[14px] font-bold">
          {activeDay === "d-day" ? "오늘 일정" : "D+1 일정"} <ChevronDown size={15} className="text-[var(--cb-text-3)]" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col">
          {currentStops.map((stop, index) => (
            <TimelineScheduleItem
              key={stop.id}
              stop={stop}
              isLast={index === currentStops.length - 1}
              selected={currentSelectedStopId === stop.id}
              active={activeStopId === stop.id}
              refCallback={(node) => {
                cardRefs.current[stop.id] = node;
              }}
              onSelect={() => selectStop(stop.id)}
              onHover={hoverStop}
            />
          ))}
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--cb-line)] bg-[rgba(14,14,16,.96)] px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <TimelineAction href="/timetable" icon={<Edit3 size={17} />} label="수정" step="CB-11" ariaLabel="수정 CB-11" />
        <TimelineAction href="/map" icon={<Map size={17} />} label="지도" step="CB-12" ariaLabel="지도 CB-12" onClick={navigateToMap} />
      </div>
    </div>
  );
}

function TimelineScheduleItem({
  stop,
  selected,
  active,
  isLast,
  refCallback,
  onSelect,
  onHover
}: {
  stop: TimetableStop;
  selected: boolean;
  active: boolean;
  isLast: boolean;
  refCallback: (node: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onHover: (stopId: string | null) => void;
}) {
  const stopNumber = getStopMarkerLabel(stop);
  const isActive = selected || active;

  return (
    <>
      <div className="flex gap-[13px]">
        <div className="flex w-[30px] shrink-0 flex-col items-center">
          <span
            className={cn(
              "grid h-[30px] w-[30px] place-items-center rounded-full border-[1.5px] text-[13px] font-black",
              stop.locked
                ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]"
                : "border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] text-[var(--cb-text)]",
              isActive && !stop.locked ? "border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow-2)]" : null
            )}
          >
            {stop.locked ? <Star size={13} fill="currentColor" /> : stopNumber}
          </span>
        </div>
        <button
          ref={refCallback}
          aria-label={stop.locked ? `일정 공연 ${stop.place}` : `일정 ${stopNumber}: ${stop.place}`}
          className={cn(
            "relative mb-0.5 min-w-0 flex-1 rounded-[var(--r-md)] border bg-[var(--cb-surface-1)] p-[13px_14px] text-left shadow-[var(--sh-card)] transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]",
            stop.locked ? "border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)]" : "border-[var(--cb-line)]",
            isActive && !stop.locked ? "scale-[1.01] border-[var(--cb-line-2)] bg-[var(--cb-surface-2)]" : null,
            isActive && stop.locked ? "scale-[1.01]" : null
          )}
          data-selected={selected ? "true" : "false"}
          onBlur={() => onHover(null)}
          onClick={onSelect}
          onFocus={() => onHover(stop.id)}
          onMouseEnter={() => onHover(stop.id)}
          onMouseLeave={() => onHover(null)}
          type="button"
        >
          {stop.locked ? (
            <>
              <div className="pr-20 text-[15px] font-extrabold text-[var(--cb-yellow-2)]">{stop.anchorTitle ?? stop.place}</div>
              <div className="mt-1.5 text-[11.5px] text-[var(--cb-text-2)]">{stop.anchorSubtitle}</div>
              <span className="absolute right-3.5 top-[13px] inline-flex items-center gap-1 rounded-[var(--r-pill)] bg-[var(--cb-yellow)] px-2 py-[3px] text-[9.5px] font-extrabold tracking-[.06em] text-[var(--cb-on-yellow)]">
                <Lock size={11} /> LOCKED
              </span>
            </>
          ) : (
            <>
              <span className="mb-2 inline-flex rounded-[var(--r-pill)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-[9px] py-[3px] text-[11px] font-bold text-[var(--cb-yellow-2)]">
                {stop.time}
              </span>
              <div className="text-[14.5px] font-bold tracking-[-.01em]">{stop.displayPlace ?? stop.place}</div>
              <div className="mt-[3px] text-[11.5px] text-[var(--cb-text-3)]">{stop.category}</div>
              <div className="mt-2 border-t border-[var(--cb-line)] pt-2 text-[11.5px] text-[var(--cb-text-2)]">
                머무는 시간 {formatStopMinutes(stop.dwellMinutes)}
              </div>
            </>
          )}
        </button>
      </div>
      {!isLast && stop.transitMinutes > 0 ? (
        <div className="my-0.5 flex items-center gap-[13px]">
          <div className="flex w-[30px] shrink-0 justify-center">
            <span className="h-[34px] w-0.5 bg-[repeating-linear-gradient(var(--cb-line-2)_0_4px,transparent_4px_8px)]" />
          </div>
          <div className="flex items-center gap-[7px] text-[11px] font-semibold text-[var(--cb-text-3)]">
            <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[11px] font-bold text-[var(--cb-text-2)]">
              {stop.routeModeShort ?? getModeLabel(stop.mode).slice(0, 1)}
            </span>
            {stop.routeModeLabel ?? getModeLabel(stop.mode)} {stop.transitMinutes}분 · {stop.routeDistance}
          </div>
        </div>
      ) : null}
    </>
  );
}

function TimelineAction({
  href,
  icon,
  label,
  step,
  ariaLabel,
  onClick
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  step: string;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex h-[46px] items-center justify-center gap-1.5 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[12.5px] font-semibold text-[var(--cb-text)] transition duration-150 hover:bg-[var(--cb-surface-3)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
      onClick={onClick}
    >
      <span className="text-[var(--cb-yellow)]">{icon}</span>
      {label}
      <span className="text-[9px] font-bold text-[var(--cb-text-3)]">{step}</span>
    </Link>
  );
}
