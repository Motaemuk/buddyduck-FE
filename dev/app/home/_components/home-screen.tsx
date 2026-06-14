"use client";

import { ChevronDown, Search, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppBar, Button, Chip } from "@/components/ui";
import { ConcertCard } from "../../_components/buddy-patterns";
import { concerts as fallbackConcerts } from "@/lib/data";

const homeCategoryFilters = ["전체", "K-POP", "뮤지컬", "페스티벌", "지역"];

export function HomeScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const concertData = fallbackConcerts;
  const filteredConcerts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return concertData.filter((concert) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [concert.artist, concert.title, concert.category, concert.venue, ...concert.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory = activeCategory === "전체" || concert.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, concertData, query]);

  return (
    <>
      <AppBar
        left={<h1 className="text-[21px] font-bold leading-none tracking-[-.02em]">공연 찾기</h1>}
        right={
          <Button size="icon" variant="outline" aria-label="공연 필터">
            <Settings2 size={18} />
          </Button>
        }
      />
      <div className="body-scroll">
        <label className="mt-2 flex h-[46px] items-center gap-2.5 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 text-[13.5px] text-[var(--cb-text-3)]">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="공연 검색"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[var(--cb-text)] outline-none placeholder:text-[var(--cb-text-3)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="공연명 / 지역 / 아티스트 검색"
            type="search"
            value={query}
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3">
          {homeCategoryFilters.map((filter) => (
            <Chip
              key={filter}
              active={activeCategory === filter}
              aria-pressed={activeCategory === filter}
              className="px-3.5"
              onClick={() => setActiveCategory(filter)}
              type="button"
            >
              {filter}
              {filter === "지역" ? <ChevronDown size={13} /> : null}
            </Chip>
          ))}
        </div>
        <div className="mb-3 mt-1 text-[15px] font-bold tracking-[-.01em]">다가오는 공연</div>
        <div className="space-y-3 pb-1">
          {filteredConcerts.map((concert) => <ConcertCard key={concert.id} concert={concert} />)}
          {filteredConcerts.length === 0 ? (
            <div className="rounded-[var(--r-lg)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] px-4 py-8 text-center text-[12.5px] text-[var(--cb-text-3)]">
              조건에 맞는 공연이 없어요.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
