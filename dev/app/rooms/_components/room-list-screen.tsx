"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppBar, Button, Skeleton } from "@/components/ui";
import { BackButton, Badge, RoomCard } from "../../_components/buddy-patterns";
import { useRooms } from "@/lib/api";
import { rooms as fallbackRooms } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MAX_INTEREST_TAGS, useAppStore } from "@/store/app-store";
import { roomHref } from "../../_lib/room-routing";
import { TagSelectionSheet } from "./tag-selection-sheet";

const roomSortOptions = ["매칭 많은 순", "날짜순", "정원순", "시간순"] as const;

export function RoomListScreen({ showTagModal = false }: { showTagModal?: boolean }) {
  const router = useRouter();
  const { data, isLoading } = useRooms();
  const roomData = data ?? fallbackRooms;
  const { selectedTags, toggleTag } = useAppStore();
  const [activeSort, setActiveSort] = useState<(typeof roomSortOptions)[number]>("매칭 많은 순");
  const sortedRooms = useMemo(() => {
    const nextRooms = [...roomData];

    if (activeSort === "날짜순") {
      return nextRooms.sort((a, b) => a.concertDate.localeCompare(b.concertDate));
    }
    if (activeSort === "정원순") {
      return nextRooms.sort((a, b) => b.maxMembers - b.currentMembers - (a.maxMembers - a.currentMembers));
    }
    if (activeSort === "시간순") {
      return nextRooms.sort((a, b) => a.meetTime.localeCompare(b.meetTime));
    }

    return nextRooms.sort((a, b) => b.match - a.match);
  }, [activeSort, roomData]);

  const closeTagModal = useCallback(() => router.push("/rooms"), [router]);

  useEffect(() => {
    if (!showTagModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTagModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeTagModal, showTagModal]);

  return (
    <>
      <AppBar
        title="Stadium Tour - Night 1"
        left={<BackButton href="/home" />}
        right={
          <Button size="icon" variant="outline" aria-label="공유">
            <Share2 size={18} />
          </Button>
        }
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className={cn("ph h-[140px]", showTagModal && "blur-[2px]")}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[rgba(8,8,9,.85)]" />
          <div className="absolute bottom-6 left-4 z-[1]">
            <h1 className="text-[17px] font-bold tracking-[-.01em]">KSPO Dome</h1>
            <p className="mt-[3px] flex items-center gap-[7px] text-[12px] text-[var(--cb-text-2)]">
              2026.06.15 (월) 19:00 · <b className="font-bold text-[var(--cb-yellow)]">D-25</b>
            </p>
          </div>
        </div>
        <div
          className={cn(
            "relative z-[3] mx-4 -mt-3 flex flex-col gap-2.5 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[var(--cb-surface-1)] px-3.5 py-[13px] shadow-[var(--sh-card)]",
            showTagModal && "blur-[2px]"
          )}
        >
          <div className="flex items-center justify-between text-[12.5px] font-semibold">
            <span>이 공연에서 내 관심 태그</span>
            <Link href="/rooms?modal=tags" className="flex items-center gap-1 text-[12px] font-semibold text-[var(--cb-yellow)]">
              편집 <Pencil size={13} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <Badge key={tag} tone="yellow">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-[12px] font-medium text-[var(--cb-text-3)]">설정해 둔 태그가 없습니다</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-1.5 pt-3.5">
          {roomSortOptions.map((option) => (
            <button
              aria-pressed={activeSort === option}
              className={cn(
                "inline-flex h-8 shrink-0 items-center rounded-[var(--r-pill)] border px-[13px] text-[12px] font-semibold transition active:scale-[0.97]",
                activeSort === option
                  ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]"
                  : "border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)]"
              )}
              key={option}
              onClick={() => setActiveSort(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-1.5">
          <div className="space-y-3">
            {isLoading && roomData.length === 0
              ? [0, 1, 2].map((item) => <Skeleton key={item} className="h-[150px]" />)
              : sortedRooms.map((room) => <RoomCard key={room.id} room={room} href={roomHref(room)} selectedTags={selectedTags} />)}
          </div>
        </div>
      </div>
      <Link
        href="/rooms/create"
        className="fixed bottom-[84px] z-30 grid h-[58px] w-[58px] place-items-center rounded-full bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[0_12px_28px_-8px_rgba(253,190,13,.6)] transition active:scale-[0.97]"
        style={{ right: "max(18px, calc((100vw - 430px) / 2 + 18px))" }}
        aria-label="방 만들기"
      >
        <Plus size={26} strokeWidth={2.4} />
      </Link>
      {showTagModal ? <InterestTagModal closeTagModal={closeTagModal} selectedTags={selectedTags} toggleTag={toggleTag} /> : null}
    </>
  );
}

function InterestTagModal({
  closeTagModal,
  selectedTags,
  toggleTag
}: {
  closeTagModal: () => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}) {
  return (
    <TagSelectionSheet
      title="관심 태그 선택"
      description={`최대 ${MAX_INTEREST_TAGS}개까지 선택 · 사전 정의된 태그에서 골라요`}
      selectedTags={selectedTags}
      maxTags={MAX_INTEREST_TAGS}
      onToggle={toggleTag}
      onDismiss={closeTagModal}
      actions={
        <>
          <Link
            className="inline-flex h-[50px] items-center justify-center rounded-[var(--r-md)] border border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] text-[14px] font-bold text-[var(--cb-text)] transition active:scale-[0.97]"
            href="/rooms"
          >
            취소
          </Link>
          <Link
            className="inline-flex h-[50px] items-center justify-center rounded-[var(--r-md)] border border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[14px] font-bold text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)] transition active:scale-[0.97]"
            href="/rooms"
          >
            저장 ({selectedTags.length}/{MAX_INTEREST_TAGS})
          </Link>
        </>
      }
    />
  );
}
