"use client";

import { AppBar } from "@/components/ui";
import { BackButton, MapPlaceCard, RouteMapCanvas } from "../../_components/buddy-patterns";
import { type TimelineDay } from "@/lib/data";
import { useAppStore } from "@/store/app-store";

export function MapScreen() {
  const timelineStopsByDay = useAppStore((state) => state.timelineStopsByDay);
  const activeDay = useAppStore((state) => state.activeTimelineDay);
  const activeStopId = useAppStore((state) => state.activeStopId);
  const selectedStopId = useAppStore((state) => state.selectedStopId);
  const setActiveTimelineDay = useAppStore((state) => state.setActiveTimelineDay);
  const selectStoreStop = useAppStore((state) => state.selectStop);
  const hoverStop = useAppStore((state) => state.hoverStop);
  const currentStops = timelineStopsByDay[activeDay];
  const currentSelectedStopId = currentStops.some((stop) => stop.id === selectedStopId) ? selectedStopId : currentStops[0]?.id ?? "";
  const selected = currentStops.find((stop) => stop.id === currentSelectedStopId) ?? currentStops[0];
  const selectedIndex = currentStops.findIndex((stop) => stop.id === currentSelectedStopId);
  const nextStop = selectedIndex >= 0 ? currentStops[selectedIndex + 1] : undefined;

  const selectStop = (stopId: string) => {
    selectStoreStop(stopId);
  };

  const moveToNextStop = () => {
    if (!nextStop) return;
    selectStoreStop(nextStop.id);
  };

  const changeDay = (day: TimelineDay) => {
    setActiveTimelineDay(day);
  };

  return (
    <>
      <AppBar
        title="지도"
        left={<BackButton href="/timeline" />}
      />
      <div className="relative min-h-0 flex-1">
        <RouteMapCanvas
          stops={currentStops}
          selectedStopId={currentSelectedStopId}
          activeStopId={activeStopId}
          activeDay={activeDay}
          onDayChange={changeDay}
          onSelectStop={selectStop}
          onHoverStop={hoverStop}
          className="absolute inset-0"
          showLabel={false}
          full
        />
      </div>
      {selected ? (
        <div className="shrink-0 border-t border-[var(--cb-line)] p-4">
          <MapPlaceCard stop={selected} hasNextStop={Boolean(nextStop)} onNextStop={moveToNextStop} />
        </div>
      ) : null}
    </>
  );
}
