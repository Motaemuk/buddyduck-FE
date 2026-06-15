"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, Plus, Search, X } from "lucide-react";
import { AppBar, Chip } from "@/components/ui";
import { places, type PlaceFixture } from "@/lib/data";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { BackButton } from "../../_components/buddy-patterns";

const categories = ["전체", "카페", "식당", "굿즈", "포토존"] as const;
type PlaceCategoryFilter = (typeof categories)[number];

export function PlaceSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlaceCategoryFilter>("전체");
  const addPlaceToTimetable = useAppStore((state) => state.addPlaceToTimetable);
  const ddayStops = useAppStore((state) => state.timelineStopsByDay["d-day"]);
  const addedPlaceNames = useMemo(() => new Set(ddayStops.map((stop) => stop.place)), [ddayStops]);
  const normalizedQuery = query.trim().toLowerCase();
  const showAddressCandidates = /[0-9]|송파|주소|대로|로|길|구|동/.test(query);

  const placeResults = useMemo(
    () =>
      places
        .filter((place) => place.resultType !== "address")
        .filter((place) => activeCategory === "전체" || place.category === activeCategory)
        .filter((place) => {
          if (!normalizedQuery) return true;
          return `${place.name} ${place.address} ${place.category} ${place.distance}`.toLowerCase().includes(normalizedQuery);
        }),
    [activeCategory, normalizedQuery]
  );
  const addressResults = useMemo(
    () =>
      showAddressCandidates
        ? places
            .filter((place) => place.resultType === "address")
            .filter((place) => `${place.name} ${place.address}`.toLowerCase().includes(normalizedQuery))
        : [],
    [normalizedQuery, showAddressCandidates]
  );

  const addPlace = (place: PlaceFixture) => {
    if (addedPlaceNames.has(place.name)) return;
    addPlaceToTimetable(place.id);
    router.push("/timetable");
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AppBar title="장소 추가" left={<BackButton href="/timetable" icon="close" />} right={<span aria-hidden className="block h-[38px] w-[38px]" />} />
      <label className="mx-4 mb-1 mt-2 flex h-[46px] shrink-0 items-center gap-2.5 rounded-[14px] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 text-[13.5px] text-[var(--cb-text)]">
        <Search size={18} className="shrink-0 text-[var(--cb-text-3)]" />
        <input
          aria-label="장소명 또는 주소 검색"
          className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-[var(--cb-text-3)]"
          placeholder="장소명 또는 주소 검색"
          role="searchbox"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button
            aria-label="검색어 지우기"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--cb-text-3)] transition duration-150 hover:bg-[var(--cb-surface-3)] hover:text-[var(--cb-text)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
            onClick={() => setQuery("")}
            type="button"
          >
            <X size={15} />
          </button>
        ) : null}
      </label>
      <div className="flex shrink-0 gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Chip key={category} active={activeCategory === category} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>
            {category}
          </Chip>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ResultSection title="장소 검색 결과">
          {placeResults.length > 0 ? (
            placeResults.map((place) => (
              <PlaceResultRow key={place.id} added={addedPlaceNames.has(place.name)} place={place} onAdd={() => addPlace(place)} />
            ))
          ) : (
            <EmptyResult text="검색 결과가 없습니다" />
          )}
        </ResultSection>

        {addressResults.length > 0 ? (
          <ResultSection title={`주소 검색 결과 "${query.trim()}"`} className="mt-5">
            {addressResults.map((place) => (
              <PlaceResultRow key={place.id} addressCandidate added={addedPlaceNames.has(place.name)} place={place} onAdd={() => addPlace(place)} />
            ))}
          </ResultSection>
        ) : null}

        <p className="pt-4 text-center text-[10.5px] leading-5 text-[var(--cb-text-3)]">
          장소명으로 검색하면 Kakao 결과, 주소를 입력하면 주소 후보가 함께 나와요.
        </p>
      </div>
    </div>
  );
}

function ResultSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className} aria-label={title}>
      <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[.1em] text-[var(--cb-text-3)]">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function PlaceResultRow({
  place,
  added,
  addressCandidate,
  onAdd
}: {
  place: PlaceFixture;
  added: boolean;
  addressCandidate?: boolean;
  onAdd: () => void;
}) {
  return (
    <div data-place-result={place.id} className="flex items-center gap-3 border-b border-[var(--cb-line)] py-[13px]">
      {addressCandidate ? (
        <div className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[14px] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow)]">
          <MapPin size={20} fill="currentColor" strokeWidth={0} />
        </div>
      ) : (
        <div className="ph grid h-[50px] w-[50px] shrink-0 place-items-end rounded-[14px] p-2 text-[9px] font-semibold tracking-[.06em] text-white/40">
          IMG
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold">{place.name}</div>
        <div className="mt-[3px] truncate text-[11.5px] text-[var(--cb-text-2)]">
          {addressCandidate ? "주소 후보" : `${place.category} · ${place.distance}`}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-[var(--cb-text-3)]">{addressCandidate ? place.distance : place.address}</div>
      </div>
      <button
        aria-label={added ? "추가됨" : "추가"}
        className={cn(
          "inline-flex h-[34px] shrink-0 items-center gap-1 rounded-[var(--r-pill)] border px-[13px] text-[12px] font-bold transition duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:focus-visible:outline-none",
          added
            ? "border-[var(--cb-line-2)] bg-transparent text-[var(--cb-text-3)] disabled:hover:bg-transparent"
            : "border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow-2)] hover:border-[var(--cb-yellow)] hover:bg-[rgba(253,190,13,.22)]"
        )}
        disabled={added}
        onClick={onAdd}
        type="button"
      >
        {added ? <Check size={13} /> : <Plus size={13} />}
        {added ? "추가됨" : "추가"}
      </button>
    </div>
  );
}

function EmptyResult({ text }: { text: string }) {
  return <div className="rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] p-4 text-center text-[12px] text-[var(--cb-text-3)]">{text}</div>;
}
