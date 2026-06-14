"use client";

import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { AppBar, Button, Chip } from "@/components/ui";
import { BackButton, MapFallback, MapPin as MapPinMarker, MapPlaceCard } from "../../_components/buddy-patterns";
import { getKakaoMapKey, loadKakaoMap, type KakaoMapState } from "@/lib/kakao-map";
import { timetableStops } from "@/lib/data";
import { useAppStore } from "@/store/app-store";

export function MapScreen() {
  const [state, setState] = useState<KakaoMapState>("loading");
  const { selectedMapStop, setSelectedMapStop } = useAppStore();
  const selected = timetableStops[selectedMapStop - 1] ?? timetableStops[1];

  useEffect(() => {
    loadKakaoMap().then(setState);
  }, []);

  return (
    <>
      <AppBar
        title="지도"
        left={<BackButton href="/timeline" />}
        right={
          <Button size="icon" variant="outline" aria-label="필터">
            <Settings2 size={18} />
          </Button>
        }
      />
      <div className="relative min-h-0 flex-1">
        <div className="map-grid absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points="18,18 42,52 68,62 60,34" fill="none" stroke="#FDBE0D" strokeWidth="0.7" strokeDasharray="2 1.6" />
          </svg>
          {[
            [1, 18, 18],
            [2, 42, 52],
            [3, 68, 62],
            [4, 60, 34]
          ].map(([id, left, top]) => (
            <MapPinMarker
              key={id}
              id={Number(id)}
              left={Number(left)}
              top={Number(top)}
              selected={selectedMapStop === id}
              onSelect={setSelectedMapStop}
            />
          ))}
        </div>
        <div className="absolute left-4 right-4 top-3 flex gap-2">
          <Chip active>D-Day</Chip>
          <Chip>D+1</Chip>
        </div>
        {state !== "ready" ? (
          <MapFallback hasKey={Boolean(getKakaoMapKey())} />
        ) : null}
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] p-4">
        <MapPlaceCard stop={selected} />
      </div>
    </>
  );
}
