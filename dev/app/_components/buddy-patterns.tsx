"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, Clock3, MapPin as MapPinIcon, Star, X } from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getModeLabel, type Concert, type Member, type Room, type TimelineDay, type TimetableStop } from "@/lib/data";
import {
  getKakaoMapKey,
  loadKakaoMaps,
  type KakaoMapInstance,
  type KakaoMapsApi,
  type KakaoOverlay
} from "@/lib/kakao-map";

export function Badge({
  children,
  tone = "muted"
}: {
  children: React.ReactNode;
  tone?: "muted" | "yellow";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--r-pill)] border px-2.5 py-1 text-[11px] font-semibold",
        tone === "yellow"
          ? "border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow-2)]"
          : "border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)]"
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-3 mt-5 text-[15px] font-bold">{title}</h2>;
}

export function BackButton({ href, icon = "back" }: { href: string; icon?: "back" | "close" }) {
  return (
    <Link
      href={href}
      className="grid h-[38px] w-[38px] place-items-center rounded-full border border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text)] transition duration-150 hover:bg-[var(--cb-surface-3)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
      aria-label="뒤로"
    >
      {icon === "close" ? <X size={20} /> : <ArrowLeft size={20} />}
    </Link>
  );
}

export function InfoRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between py-1.5", strong && "text-[15px] font-black text-[var(--cb-yellow)]")}>
      <span className="text-[var(--cb-text-3)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function ConcertCard({ concert, href = "/rooms" }: { concert: Concert; href?: string }) {
  return (
    <Link
      href={href}
      className="flex gap-[13px] rounded-[var(--r-lg)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] p-3 shadow-[var(--sh-card)] transition duration-150 hover:border-[var(--cb-line-2)] hover:bg-[var(--cb-surface-2)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
    >
      <div className="ph grid h-[72px] w-[72px] place-items-end rounded-[var(--r-md)] p-2 text-[9px] font-semibold tracking-[.06em] text-white/40">
        POSTER
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px]">
        <h2 className="truncate text-[15px] font-bold tracking-[-.01em]">{concert.title}</h2>
        <p className="truncate text-[12.5px] text-[var(--cb-text-2)]">
          <span>{concert.artist}</span> · {concert.venue}
        </p>
        <p className="mt-[3px] flex items-center gap-1.5 text-[11.5px] text-[var(--cb-text-3)]">
          <CalendarDays size={14} /> {concert.date} · 열린 방 <b className="font-bold text-[var(--cb-yellow)]">{concert.roomCount}</b>
        </p>
      </div>
    </Link>
  );
}

export function RoomCard({
  room,
  href,
  compact = false,
  selectedTags = []
}: {
  room: Room;
  href: string;
  compact?: boolean;
  selectedTags?: string[];
}) {
  const isFull = room.currentMembers >= room.maxMembers;
  const matchCount = room.tags.filter((tag) => selectedTags.includes(tag)).length;
  const hasInterestMatch = selectedTags.length > 0;
  const matchLabel = hasInterestMatch ? `${matchCount}/${selectedTags.length} match` : `매칭률 ${room.match}%`;

  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "interactive-surface-card flex flex-col gap-[11px]",
          isFull && "opacity-50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-[9px]">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-[var(--cb-surface-3)] text-[11px] font-bold uppercase text-[var(--cb-text-2)]",
                room.status === "host" ? "border-[var(--cb-yellow)] text-[var(--cb-yellow)] shadow-[0_0_0_1px_var(--cb-yellow-line)]" : "border-[var(--cb-line)]"
              )}
            >
              {(room.hostAvatar || room.hostNickname).slice(0, 1)}
            </span>
            <span className="truncate text-[13px] font-semibold">{room.hostNickname}</span>
          </div>
          {isFull ? (
            <span className="rounded-[var(--r-sm)] border border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] px-[9px] py-1 text-[10.5px] font-bold uppercase tracking-[.04em] text-[var(--cb-text-3)]">
              정원 마감
            </span>
          ) : (
            <span
              className={cn(
                "rounded-[var(--r-sm)] border px-[9px] py-1 text-[11px] font-bold tracking-normal",
                hasInterestMatch && matchCount === selectedTags.length
                  ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]"
                  : "border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow-2)]"
              )}
            >
              {matchLabel}
            </span>
          )}
        </div>
        <h2 className={cn("font-bold leading-[1.4] tracking-[-.01em]", compact ? "text-[14px]" : "text-[15px]")}>{room.title}</h2>
        <div className="flex flex-wrap gap-1.5">
          {room.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} tone={selectedTags.includes(tag) ? "yellow" : "muted"}>
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex min-w-0 items-center gap-1.5 truncate text-[12px] text-[var(--cb-text-2)]">
            <MapPinIcon size={14} className="shrink-0 text-[var(--cb-text-3)]" />
            <span className="truncate">{room.meetPlace}</span>
            <span className="shrink-0 text-[var(--cb-text-3)]">·</span>
            <Clock3 size={14} className="shrink-0 text-[var(--cb-text-3)]" />
            <span className="shrink-0">{room.meetTime}</span>
          </div>
          <span className="shrink-0 rounded-[var(--r-pill)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-[11px] py-1 text-[11.5px] font-semibold text-[var(--cb-text-2)]">
            {room.currentMembers} / {room.maxMembers}
          </span>
        </div>
      </Card>
    </Link>
  );
}

export function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3">
      <Avatar name={member.avatar || member.nickname} host={member.role === "host"} />
      <div className="flex-1 text-[13px] font-semibold">{member.nickname}</div>
      <Badge tone={member.role === "pending" ? "yellow" : "muted"}>
        {member.role === "host" ? "HOST" : member.role === "pending" ? "승인 대기" : "MEMBER"}
      </Badge>
    </div>
  );
}

export function TimelineBlock({ stops, detailed = false }: { stops: TimetableStop[]; detailed?: boolean }) {
  return (
    <div className="space-y-2">
      {stops.map((stop, index) => (
        <div key={stop.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--cb-yellow)] text-[12px] font-black text-[var(--cb-on-yellow)]">
              {stop.locked ? <Star size={13} fill="currentColor" /> : getStopMarkerLabel(stop)}
            </span>
            {index < stops.length - 1 ? <span className="h-10 w-px bg-[var(--cb-line-2)]" /> : null}
          </div>
          <div className="min-w-0 flex-1 rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3">
            <div className="flex justify-between gap-2">
              <div className="truncate text-[13px] font-bold">{stop.place}</div>
              <div className="shrink-0 text-[11px] font-semibold text-[var(--cb-yellow)]">{stop.time}</div>
            </div>
            {detailed ? (
              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--cb-text-3)]">
                <span>{stop.category}</span>
                <span>{stop.locked ? "공연 시간 잠김" : `${getModeLabel(stop.mode)} ${stop.transitMinutes}분`}</span>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapFallback({ hasKey }: { hasKey: boolean }) {
  return (
    <div className="absolute inset-x-4 bottom-3 z-10 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[rgba(22,22,24,.88)] p-3 text-[11px] leading-5 text-[var(--cb-text-2)] backdrop-blur">
      Kakao Maps fallback · {hasKey ? "스크립트 로딩 중 또는 실패" : "NEXT_PUBLIC_KAKAO_MAP_KEY 미설정"}
    </div>
  );
}

export function MapPin({
  id,
  label,
  children,
  left,
  top,
  selected,
  active,
  anchor,
  onSelect,
  onHover
}: {
  id: number | string;
  label?: string;
  children?: React.ReactNode;
  left: number;
  top: number;
  selected: boolean;
  active?: boolean;
  anchor?: boolean;
  onSelect: (id: number | string) => void;
  onHover?: (id: number | string | null) => void;
}) {
  const isActive = Boolean(selected || active);

  return (
    <button
      aria-current={selected ? "true" : undefined}
      aria-label={label ?? `지도 핀 ${id}`}
      className={cn(
        "absolute z-[3] grid h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] place-items-center rounded-[50%_50%_50%_2px] border-[1.5px] text-[12px] font-black shadow-[0_6px_14px_-4px_rgba(0,0,0,.7)] transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]",
        anchor
          ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[0_0_0_4px_rgba(253,190,13,.18),0_6px_14px_-4px_rgba(0,0,0,.7)]"
          : "border-[var(--cb-line-2)] bg-[var(--cb-surface-1)] text-[var(--cb-text)]",
        isActive && !anchor
          ? "scale-110 border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[0_0_0_4px_rgba(253,190,13,.18),0_6px_14px_-4px_rgba(0,0,0,.7)]"
          : null,
        isActive && anchor ? "scale-110" : null
      )}
      data-active={isActive ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      style={{ left: `${left}%`, top: `${top}%` }}
      onClick={() => onSelect(id)}
      onBlur={() => onHover?.(null)}
      onFocus={() => onHover?.(id)}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      type="button"
    >
      <span className="rotate-45">{children ?? id}</span>
    </button>
  );
}

export function RouteMapCanvas({
  stops,
  selectedStopId,
  activeStopId,
  activeDay,
  onDayChange,
  onSelectStop,
  onHoverStop,
  className,
  showLabel = true,
  showFallbackNotice = true,
  full = false
}: {
  stops: TimetableStop[];
  selectedStopId: string;
  activeStopId?: string | null;
  activeDay?: TimelineDay;
  onDayChange?: (day: TimelineDay) => void;
  onSelectStop: (stopId: string) => void;
  onHoverStop?: (stopId: string | null) => void;
  className?: string;
  showLabel?: boolean;
  showFallbackNotice?: boolean;
  full?: boolean;
}) {
  const hasKakaoKey = Boolean(getKakaoMapKey());
  const [internalDay, setInternalDay] = useState<TimelineDay>("d-day");
  const [kakao, setKakao] = useState<KakaoMapsApi | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "fallback">(hasKakaoKey ? "loading" : "fallback");
  const mapRef = useRef<HTMLDivElement>(null);
  const routePoints = stops.map((stop) => `${stop.mapPoint.left},${stop.mapPoint.top}`).join(" ");
  const currentDay = activeDay ?? internalDay;
  const setCurrentDay = onDayChange ?? setInternalDay;
  const hasStops = stops.length > 0;
  const focusedStop = stops.find((stop) => stop.id === selectedStopId) ?? stops[0];
  const focusOffset = full && focusedStop
    ? {
        x: 50 - focusedStop.mapPoint.left,
        y: 50 - focusedStop.mapPoint.top
      }
    : null;

  useEffect(() => {
    if (!hasKakaoKey) return;

    let active = true;

    loadKakaoMaps().then((api) => {
      if (!active) return;
      setKakao(api);
      setMapState(api ? "ready" : "fallback");
    });

    return () => {
      active = false;
    };
  }, [hasKakaoKey]);

  useEffect(() => {
    if (!kakao || !mapRef.current || !hasStops) return;

    const overlays: KakaoOverlay[] = [];
    const points = stops.map((stop) => new kakao.maps.LatLng(stop.mapPoint.lat, stop.mapPoint.lng));
    const map = new kakao.maps.Map(mapRef.current, {
      center: points[Math.min(1, points.length - 1)],
      level: full ? 5 : 6
    });
    const bounds = new kakao.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    map.setBounds(bounds);
    map.relayout();
    if (full) {
      const selectedPoint = stops.find((stop) => stop.id === selectedStopId);
      if (selectedPoint) {
        map.panTo(new kakao.maps.LatLng(selectedPoint.mapPoint.lat, selectedPoint.mapPoint.lng));
      }
    }

    overlays.push(
      new kakao.maps.Polyline({
        map,
        path: points,
        strokeWeight: full ? 3 : 2,
        strokeColor: "#FDBE0D",
        strokeOpacity: 0.85,
        strokeStyle: "shortdash"
      })
    );

    stops.forEach((stop) => {
      const content = createKakaoPinButton(kakao, map, stop, selectedStopId, activeStopId ?? null, onSelectStop, onHoverStop);
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(stop.mapPoint.lat, stop.mapPoint.lng),
        content,
        xAnchor: 0.5,
        yAnchor: 0.85,
        clickable: true
      });
      overlay.setMap(map);
      overlays.push(overlay);
    });

    return () => {
      overlays.forEach((overlay) => overlay.setMap(null));
    };
  }, [activeStopId, full, hasStops, kakao, onHoverStop, onSelectStop, selectedStopId, stops]);

  const showMockLayer = mapState !== "ready";

  return (
    <section
      aria-label="일정 지도"
      className={cn(
        "map-grid relative shrink-0 overflow-hidden bg-[#121214]",
        "before:absolute before:inset-0 before:opacity-50 before:content-['']",
        "after:absolute after:inset-0 after:bg-[linear-gradient(60deg,transparent_48%,rgba(255,255,255,.05)_49%_51%,transparent_52%),linear-gradient(-25deg,transparent_38%,rgba(255,255,255,.045)_39%_40.5%,transparent_41%),linear-gradient(110deg,transparent_64%,rgba(255,255,255,.04)_65%_66%,transparent_67%)] after:content-['']",
        className
      )}
      data-map-state={mapState}
      style={{ viewTransitionName: "buddyduck-route-map" }}
    >
      <div ref={mapRef} className={cn("absolute inset-0 z-[1]", showMockLayer && "hidden")} />
      {showMockLayer && hasStops ? (
        <div
          className="absolute inset-0 z-[2] transition-transform duration-300 ease-out motion-reduce:transition-none"
          data-centered-stop={focusedStop?.id}
          data-map-focus-layer
          style={focusOffset ? { transform: `translate(${focusOffset.x}%, ${focusOffset.y}%)` } : undefined}
        >
          <svg className="absolute inset-0 z-[2] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={routePoints}
              fill="none"
              stroke="#FDBE0D"
              strokeDasharray="2.4 1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {stops.map((stop) => (
            <MapPin
              key={stop.id}
              id={stop.id}
              label={getMapPinLabel(stop)}
              left={stop.mapPoint.left}
              top={stop.mapPoint.top}
              selected={selectedStopId === stop.id}
              active={activeStopId === stop.id}
              anchor={stop.locked}
              onSelect={(id) => onSelectStop(String(id))}
              onHover={(id) => onHoverStop?.(id ? String(id) : null)}
            >
              {stop.locked ? <Star size={14} fill="currentColor" /> : getStopMarkerLabel(stop)}
            </MapPin>
          ))}
        </div>
      ) : null}
      {showLabel ? (
        <span className="absolute left-3.5 top-3 z-[4] rounded-[var(--r-sm)] border border-[var(--cb-line)] bg-[rgba(15,15,17,.7)] px-2 py-1 text-[9px] font-bold tracking-[.1em] text-[var(--cb-text-3)] [font-family:var(--mono)]">
          MAP PREVIEW
        </span>
      ) : null}
      <div className="absolute right-3.5 top-3 z-[4] flex rounded-[var(--r-pill)] border border-[var(--cb-line)] bg-[rgba(15,15,17,.85)] p-[3px] backdrop-blur">
        <button
          aria-label="D-Day 일정 보기"
          aria-pressed={currentDay === "d-day"}
          className={cn(
            "rounded-[var(--r-pill)] px-[13px] py-[5px] text-[11.5px] font-bold text-[var(--cb-text-2)] transition duration-150 hover:bg-[var(--cb-surface-3)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cb-yellow)]",
            currentDay === "d-day" && "bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] hover:bg-[var(--cb-yellow-2)]"
          )}
          onClick={() => setCurrentDay("d-day")}
          type="button"
        >
          D-Day
          <span className="sr-only"> 일정 보기</span>
        </button>
        <button
          aria-label="D+1 일정 보기"
          aria-pressed={currentDay === "d-plus-1"}
          className={cn(
            "rounded-[var(--r-pill)] px-[13px] py-[5px] text-[11.5px] font-bold text-[var(--cb-text-2)] transition duration-150 hover:bg-[var(--cb-surface-3)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cb-yellow)]",
            currentDay === "d-plus-1" && "bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] hover:bg-[var(--cb-yellow-2)]"
          )}
          onClick={() => setCurrentDay("d-plus-1")}
          type="button"
        >
          D+1
          <span className="sr-only"> 일정 보기</span>
        </button>
      </div>
      {!hasStops ? (
        <div className="absolute left-4 right-4 top-1/2 z-[5] -translate-y-1/2 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[rgba(14,14,16,.84)] p-3 text-center text-[12px] font-semibold text-[var(--cb-text-2)] backdrop-blur">
          선택한 날짜의 일정은 아직 등록되지 않았어요
        </div>
      ) : null}
      {showFallbackNotice && mapState !== "ready" && hasStops ? <MapFallback hasKey={hasKakaoKey} /> : null}
    </section>
  );
}

export function MapPlaceCard({
  stop,
  hasNextStop = false,
  onNextStop
}: {
  stop: TimetableStop;
  hasNextStop?: boolean;
  onNextStop?: () => void;
}) {
  return (
    <Card className="flex gap-3 transition duration-200 hover:border-[var(--cb-line-2)] hover:shadow-[0_14px_34px_rgba(0,0,0,.24)]">
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-black",
          stop.locked ? "bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]" : "bg-[var(--cb-surface-3)] text-[var(--cb-text)]"
        )}
      >
        {stop.locked ? <Star size={14} fill="currentColor" /> : getStopMarkerLabel(stop)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{stop.place}</div>
        <div className="mt-1 text-[11px] text-[var(--cb-text-2)]">{stop.category} · Kakao</div>
        <div className="mt-1 truncate text-[11px] text-[var(--cb-text-3)]">{stop.address}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--cb-text-3)]">
          <Clock3 size={13} /> {stop.time} · {stop.locked ? "도착 버퍼" : "머무는 시간"} {formatStopMinutes(stop.dwellMinutes)}
        </div>
      </div>
      <button
        aria-label={hasNextStop ? "다음 동선으로 이동" : "마지막 동선입니다"}
        className="grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)] transition duration-150 hover:-translate-y-0.5 hover:border-[var(--cb-yellow-line)] hover:bg-[var(--cb-yellow-dim)] hover:text-[var(--cb-yellow)] active:translate-y-0 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:border-[var(--cb-line)] disabled:hover:bg-[var(--cb-surface-2)] disabled:hover:text-[var(--cb-text-2)]"
        disabled={!hasNextStop}
        onClick={onNextStop}
        type="button"
      >
        <ChevronRight size={18} />
      </button>
    </Card>
  );
}

export function formatStopMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
  }
  return `${minutes}분`;
}

export function getMapPinLabel(stop: TimetableStop) {
  return stop.locked ? `지도 핀 공연: ${stop.place}` : `지도 핀 ${getStopMarkerLabel(stop)}: ${stop.place}`;
}

export function getStopMarkerLabel(stop: TimetableStop) {
  return stop.pinLabel ?? stop.id.replace(/^\D+/, "");
}

function createKakaoPinButton(
  kakao: KakaoMapsApi,
  map: KakaoMapInstance,
  stop: TimetableStop,
  selectedStopId: string,
  activeStopId: string | null,
  onSelectStop: (stopId: string) => void,
  onHoverStop?: (stopId: string | null) => void
) {
  const button = document.createElement("button");
  const isActive = selectedStopId === stop.id || activeStopId === stop.id;
  button.type = "button";
  button.ariaLabel = getMapPinLabel(stop);
  button.dataset.active = isActive ? "true" : "false";
  button.dataset.selected = selectedStopId === stop.id ? "true" : "false";
  if (selectedStopId === stop.id) button.setAttribute("aria-current", "true");
  button.className = cn(
    "grid h-[30px] w-[30px] rotate-[-45deg] place-items-center rounded-[50%_50%_50%_2px] border-[1.5px] text-[12px] font-black shadow-[0_6px_14px_-4px_rgba(0,0,0,.7)] transition duration-150",
    stop.locked
      ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[0_0_0_4px_rgba(253,190,13,.18),0_6px_14px_-4px_rgba(0,0,0,.7)]"
      : "border-[var(--cb-line-2)] bg-[var(--cb-surface-1)] text-[var(--cb-text)]",
    isActive && !stop.locked
      ? "scale-110 border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[0_0_0_4px_rgba(253,190,13,.18),0_6px_14px_-4px_rgba(0,0,0,.7)]"
      : null,
    isActive && stop.locked ? "scale-110" : null
  );
  button.innerHTML = `<span class="rotate-45">${stop.locked ? "★" : getStopMarkerLabel(stop)}</span>`;
  button.addEventListener("click", () => {
    kakao.maps.event.preventMap();
    onSelectStop(stop.id);
  });
  button.addEventListener("mouseenter", () => onHoverStop?.(stop.id));
  button.addEventListener("mouseleave", () => onHoverStop?.(null));
  button.addEventListener("focus", () => onHoverStop?.(stop.id));
  button.addEventListener("blur", () => onHoverStop?.(null));
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      kakao.maps.event.preventMap();
      onSelectStop(stop.id);
      map.relayout();
    }
  });
  return button;
}
