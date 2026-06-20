"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { AppBar, Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  getActiveMyRoomCards,
  getPastMyRoomCards,
  myRoomFooterText,
  myRoomRoleLabel,
  type MyRoomCardModel,
  type MyRoomCardStatus,
  type MyRoomFilter
} from "../../_lib/my-room-cards";

const myRoomFilters = [
  { key: "all", label: "전체" },
  { key: "host", label: "방장" },
  { key: "member", label: "참여중" },
  { key: "pending", label: "대기중" }
] as const;

export function MyRoomsScreen() {
  const [filter, setFilter] = useState<MyRoomFilter>("all");
  const activeRooms = useMemo(() => getActiveMyRoomCards(), []);
  const counts = {
    host: activeRooms.filter((room) => room.status === "host").length,
    member: activeRooms.filter((room) => room.status === "member").length,
    pending: activeRooms.filter((room) => room.status === "pending").length
  };
  const currentRooms = activeRooms.filter((room) => {
    if (filter === "all") return true;
    return room.status === filter;
  });
  const pastRooms = filter === "all" ? getPastMyRoomCards() : [];
  const sections = [
    { id: "current", title: "오늘 / 이번 주", rooms: currentRooms },
    { id: "past", title: "지난 방", rooms: pastRooms }
  ].filter((section) => section.rooms.length > 0);

  return (
    <>
      <AppBar left={<h1 className="text-[21px] font-bold leading-none tracking-[-.02em]">내 방</h1>} />
      <div className="flex h-[calc(100dvh-116px)] min-h-0 flex-col">
        <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-1 pt-3.5" role="group" aria-label="내 방 상태 필터">
          {myRoomFilters.map((item) => {
            const count = item.key === "all" ? null : counts[item.key];

            return (
              <button
                aria-label={count === null ? item.label : `${item.label} ${count}`}
                aria-pressed={filter === item.key}
                key={item.key}
                className={cn(
                  "inline-flex h-[34px] shrink-0 items-center gap-[7px] rounded-[var(--r-pill)] border px-3.5 text-[12.5px] font-semibold transition duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]",
                  filter === item.key
                    ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] hover:bg-[var(--cb-yellow-2)]"
                    : "border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)] hover:border-[var(--cb-line-2)] hover:bg-[var(--cb-surface-3)] hover:text-[var(--cb-text)]"
                )}
                onClick={() => setFilter(item.key)}
                type="button"
              >
                {item.label}
                {count === null ? null : (
                  <>
                    {" "}
                    <span
                      className={cn(
                        "rounded-[var(--r-pill)] px-1.5 py-px text-[10px] font-extrabold",
                        filter === item.key ? "bg-[var(--cb-on-yellow)] text-[var(--cb-yellow)]" : "bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]"
                      )}
                    >
                      {count}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-[88px] pt-0">
          {sections.length > 0 ? (
            sections.map((section) => (
              <section aria-labelledby={`my-rooms-${section.id}`} key={section.id}>
                <h2
                  className="mx-4 mb-2.5 mt-[18px] text-[10.5px] font-bold uppercase tracking-[.1em] text-[var(--cb-text-3)]"
                  id={`my-rooms-${section.id}`}
                >
                  {section.title}
                </h2>
                {section.rooms.map((room) => (
                  <MyRoomCard key={room.id} room={room} />
                ))}
              </section>
            ))
          ) : (
            <Card className="mx-4 mt-[18px] p-5 text-center">
              <p className="text-[13px] text-[var(--cb-text-2)]">아직 표시할 방이 없습니다.</p>
              <Button asChild className="mt-4">
                <Link href="/rooms">방 만들기</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function MyRoomCard({ room }: { room: MyRoomCardModel }) {
  const isPendingOrPast = room.status === "pending" || room.status === "past";
  const cardClassName = cn(
    "relative mx-4 mb-3 flex gap-3 rounded-[var(--r-lg)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] p-3 shadow-[var(--sh-card)] transition duration-150 hover:border-[var(--cb-line-2)] hover:bg-[var(--cb-surface-2)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]",
    room.status === "past" && "opacity-[.62]"
  );

  const content = (
    <>
      <div className="ph h-[60px] w-[60px] rounded-[var(--r-md)]">
        <span className="absolute bottom-2 left-[9px] font-mono text-[9px] font-semibold leading-none tracking-[.06em] text-white/35">
          ROOM
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <div
          className={cn(
            "truncate pr-[42px] text-[14px] font-bold tracking-[-.01em]",
            isPendingOrPast && "text-[var(--cb-text-2)]"
          )}
        >
          {room.title}
        </div>
        <div className="text-[11.5px] text-[var(--cb-text-3)]">
          {room.concertTitle} · {room.dateLabel}
        </div>
        <div className="mt-[5px] flex items-center gap-1.5 text-[12px] text-[var(--cb-text-2)]">
          <MapPin size={13} className="shrink-0 text-[var(--cb-text-3)]" />
          <span className="min-w-0 truncate">{room.meetPlace}</span>
          <span className="shrink-0 text-[var(--cb-text-3)]">·</span>
          <span className="shrink-0">{room.meetTime}</span>
        </div>
        <div className="mt-[7px] flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-[11.5px] text-[var(--cb-text-3)]">
            <span className={myRoomRoleBadgeClass(room.status)}>{myRoomRoleLabel(room.status)}</span>
            <span className="truncate">{myRoomFooterText(room)}</span>
          </div>
          {room.pendingCount ? (
            <span className="shrink-0 rounded-[var(--r-pill)] bg-[var(--cb-yellow)] px-[9px] py-[3px] text-[10.5px] font-extrabold text-[var(--cb-on-yellow)]">
              승인 대기 {room.pendingCount}건
            </span>
          ) : null}
        </div>
      </div>
      {room.countdown ? (
        <div className="absolute right-3 top-3 rounded-[var(--r-sm)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-2 py-[3px] text-[11px] font-extrabold text-[var(--cb-yellow)]">
          {room.countdown}
        </div>
      ) : null}
    </>
  );

  if (!room.href) {
    return (
      <div className={cardClassName} aria-label={room.title}>
        {content}
      </div>
    );
  }

  return (
    <Link href={room.href} className={cardClassName}>
      {content}
    </Link>
  );
}

function myRoomRoleBadgeClass(status: MyRoomCardStatus) {
  return cn(
    "shrink-0 rounded-[var(--r-sm)] px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-[.04em]",
    status === "host" && "bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]",
    status === "member" && "border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow-2)]",
    status === "pending" && "border border-[var(--cb-line-2)] text-[var(--cb-text-2)]",
    status === "past" && "border border-[var(--cb-line)] text-[var(--cb-text-3)]"
  );
}
