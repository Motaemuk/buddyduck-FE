"use client";

import { useRouter } from "next/navigation";
import { Check, MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";
import { AppBar, Button, Card } from "@/components/ui";
import { BackButton, SectionTitle } from "../../_components/buddy-patterns";
import { places } from "@/lib/data";

export function PlaceSearchScreen() {
  const router = useRouter();
  const [added, setAdded] = useState<string[]>([]);
  const selectPlace = (placeName: string) => {
    setAdded((current) => (current.includes(placeName) ? current : [...current, placeName]));
    if (window.history.length > 1) router.back();
    else router.push("/timetable");
  };

  return (
    <>
      <AppBar title="장소 검색" left={<BackButton href="/timetable" />} />
      <div className="mx-4 mb-2 flex h-[46px] shrink-0 items-center gap-2 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3 text-[13.5px] text-[var(--cb-text-2)]">
        <Search size={18} /> 송파대로 123 또는 장소명
      </div>
      <div className="body-scroll">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[.1em] text-[var(--cb-text-3)]">장소 검색 결과</div>
        <div className="space-y-2">
          {places.map((place) => (
            <div key={place.name} className="flex gap-3 rounded-[var(--r-md)] bg-[var(--cb-surface-1)] p-3">
              <div className="ph h-14 w-14 rounded-[var(--r-sm)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{place.name}</div>
                <div className="mt-1 text-[11px] text-[var(--cb-text-2)]">{place.category} · {place.distance}</div>
                <div className="mt-1 truncate text-[11px] text-[var(--cb-text-3)]">{place.address}</div>
              </div>
              <Button
                size="sm"
                variant={added.includes(place.name) ? "outline" : "primary"}
                className="h-8 w-[66px] text-[12px]"
                onClick={() => selectPlace(place.name)}
              >
                {added.includes(place.name) ? <Check size={14} /> : <Plus size={14} />}
                추가
              </Button>
            </div>
          ))}
        </div>
        <SectionTitle title='주소 검색 결과 "송파대로 123"' />
        <Card className="flex gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow)]">
            <MapPin size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold">서울 송파구 송파대로 123</div>
            <div className="mt-1 text-[11px] text-[var(--cb-text-3)]">(우) 05552 · 좌표 37.5113, 127.0837</div>
          </div>
        </Card>
      </div>
    </>
  );
}
