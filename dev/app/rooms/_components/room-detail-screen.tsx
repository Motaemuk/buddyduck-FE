"use client";

import Link from "next/link";
import { CalendarDays, Check, Clock3, Lock, MapPin, MessageCircle, Plus, Tag, Users, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppBar, Avatar, Button, Input, Modal } from "@/components/ui";
import { BackButton, Badge } from "../../_components/buddy-patterns";
import { getConcert, rooms as fallbackRooms, type Room, type RoomApplicant, type RoomParticipant, type RoomStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

type RoomDetailScreenProps = {
  mode?: RoomStatus;
  roomId?: string;
  detailHref?: string;
  showApplyModal?: boolean;
  showOpenChatModal?: boolean;
};

type ApplicantDecision = {
  type: "approve" | "reject";
  applicant: RoomApplicant;
};

export function RoomDetailScreen({
  mode,
  roomId,
  detailHref,
  showApplyModal = false,
  showOpenChatModal = false
}: RoomDetailScreenProps) {
  const room = resolveRoom({ roomId, mode });
  const roomMode = room.status;
  const concert = getConcert(room.concertId);
  const canonicalHref = detailHref ?? `/rooms/${room.id}`;
  const canOpenChat = roomMode === "host" || roomMode === "member";
  const [participants, setParticipants] = useState<RoomParticipant[]>(room.participants);
  const [applicants, setApplicants] = useState<RoomApplicant[]>(room.applicants);
  const [pendingDecision, setPendingDecision] = useState<ApplicantDecision | null>(null);
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(null);
  const noticeIdRef = useRef(0);

  const showNotice = useCallback((message: string) => {
    noticeIdRef.current += 1;
    setNotice({ id: noticeIdRef.current, message });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(null), 1600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const approveApplicant = useCallback((applicant: RoomApplicant) => {
    setApplicants((current) => current.filter((item) => item.id !== applicant.id));
    setParticipants((current) => [
      ...current,
      {
        id: applicant.id,
        nickname: applicant.nickname,
        avatar: applicant.avatar,
        role: "member",
        profileLabel: applicant.profileLabel,
        joinedLabel: "방금 승인",
        commonInterests: Math.max(1, applicant.applicationTags.length)
      }
    ]);
    setPendingDecision(null);
    showNotice(`${applicant.nickname} 님을 멤버로 추가했어요`);
  }, [showNotice]);

  const rejectApplicant = useCallback((applicant: RoomApplicant) => {
    setApplicants((current) => current.filter((item) => item.id !== applicant.id));
    setPendingDecision(null);
    showNotice(`${applicant.nickname} 님의 신청을 삭제했어요`);
  }, [showNotice]);

  return (
    <>
      <AppBar title="방 상세" left={<BackButton href="/rooms" />} right={<RoomAppBarActions detailHref={canonicalHref} canOpenChat={canOpenChat} />} />
      {notice ? <RoomToast key={notice.id} message={notice.message} /> : null}
      <div className="min-h-0 flex-1 overflow-y-auto pb-5">
        <RoomDetailHero room={room} concertVenue={concert.venue} />
        <RoomStateStrip room={room} memberCount={participants.length} applicantCount={applicants.length} />
        <RoomInfo room={room} concertTitle={concert.title} />
        <SchedulePreview room={room} />
        {roomMode === "host" ? <ApplicantSection applicants={applicants} onApprove={(applicant) => setPendingDecision({ type: "approve", applicant })} onReject={(applicant) => setPendingDecision({ type: "reject", applicant })} /> : null}
        <MemberSection room={room} participants={participants} />
      </div>
      <RoomBottomCta mode={roomMode} detailHref={canonicalHref} />
      {pendingDecision ? (
        <ApplicantDecisionModal
          decision={pendingDecision}
          onCancel={() => setPendingDecision(null)}
          onConfirm={() => {
            if (pendingDecision.type === "approve") {
              approveApplicant(pendingDecision.applicant);
              return;
            }

            rejectApplicant(pendingDecision.applicant);
          }}
        />
      ) : null}
      {showApplyModal && roomMode === "visitor" ? <ApplyModal detailHref={canonicalHref} /> : null}
      {canOpenChat && showOpenChatModal ? <OpenChatInfoModal room={room} onCopyNotice={showNotice} /> : null}
    </>
  );
}

function resolveRoom({ roomId, mode }: { roomId?: string; mode?: RoomStatus }) {
  return fallbackRooms.find((item) => (roomId ? item.id === roomId : item.status === mode)) ?? fallbackRooms[0];
}

function RoomAppBarActions({
  detailHref,
  canOpenChat
}: {
  detailHref: string;
  canOpenChat: boolean;
}) {
  if (canOpenChat) {
    return (
      <Link
        href={`${detailHref}?modal=open-chat`}
        className="inline-flex h-[34px] items-center gap-1.5 rounded-[var(--r-pill)] bg-[var(--cb-yellow)] px-3 text-[12px] font-bold text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)] transition duration-150 hover:bg-[var(--cb-yellow-2)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
      >
        <MessageCircle size={15} strokeWidth={2.2} />
        오픈채팅
      </Link>
    );
  }

  return null;
}

function RoomDetailHero({ room, concertVenue }: { room: Room; concertVenue: string }) {
  return (
    <section className="rd-banner relative h-[130px] shrink-0 overflow-hidden">
      <div className="ph h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-25% to-[rgba(8,8,9,.9)]" />
      {room.status !== "visitor" ? (
        <span className={cn("absolute right-3.5 top-3.5 z-[1] rounded-[var(--r-pill)] border px-3 py-1 text-[10.5px] font-extrabold tracking-[.05em] backdrop-blur", rolePillClass(room.status))}>
          {room.status === "host" ? "HOST" : room.status === "member" ? "MEMBER" : "PENDING"}
        </span>
      ) : null}
      <div className="absolute bottom-3.5 left-4 z-[1]">
        <div className="text-[15px] font-bold">{concertVenue}</div>
        <div className="mt-[3px] text-[11.5px] text-[var(--cb-text-2)]">
          {room.concertDate} {room.concertTime} · <b className="font-bold text-[var(--cb-yellow)]">{room.concertDday}</b>
        </div>
      </div>
    </section>
  );
}

function rolePillClass(status: RoomStatus) {
  if (status === "host") return "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]";
  if (status === "member") return "border-[var(--cb-yellow-line)] bg-[rgba(20,20,22,.72)] text-[var(--cb-yellow-2)]";
  return "border-[var(--cb-line-2)] border-dashed bg-[rgba(20,20,22,.72)] text-[var(--cb-text-2)]";
}

function RoomStateStrip({ room, memberCount, applicantCount }: { room: Room; memberCount: number; applicantCount: number }) {
  const stateText = {
    host: `내 역할: 방장 · 멤버 ${memberCount} / ${room.maxMembers}`,
    member: `참여 확정 · 멤버 ${memberCount} / ${room.maxMembers}`,
    pending: `승인 대기 중 · ${room.pendingLabel ?? "신청 후 1시간"}`,
    visitor: `공개 방 · 멤버 ${memberCount} / ${room.maxMembers}`
  }[room.status];
  const rightText = {
    host: `승인 대기 ${applicantCount}건`,
    member: room.approvedLabel ?? "승인됨",
    pending: "취소 가능",
    visitor: "신청 가능"
  }[room.status];

  return (
    <div className="state-strip flex shrink-0 items-center justify-between border-b border-[var(--cb-line)] bg-[var(--cb-surface-1)] px-4 py-3 text-[12.5px]">
      <div className="flex min-w-0 items-center gap-[9px] font-semibold">
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full bg-[var(--cb-yellow)]",
            room.status === "pending" && "border border-dashed border-[var(--cb-yellow)] bg-transparent",
            room.status === "visitor" && "bg-[var(--cb-text-3)]"
          )}
        />
        <span className="truncate">{stateText}</span>
      </div>
      <div className="shrink-0 text-[11.5px] font-medium text-[var(--cb-text-3)]">{rightText}</div>
    </div>
  );
}

function RoomInfo({ room, concertTitle }: { room: Room; concertTitle: string }) {
  const tagTone = room.status === "visitor" ? "muted" : "yellow";

  return (
    <section className="room-info px-4 py-4">
      <h1 className="text-[18px] font-extrabold leading-[1.35] tracking-[-.02em] text-balance">{room.title}</h1>
      <p className="mt-[7px] text-[13px] leading-[1.6] text-[var(--cb-text-2)]">{room.description}</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-[11px] text-[12.5px]">
        <RoomInfoKey icon={<MapPin size={13} />}>집합</RoomInfoKey>
        <dd className="font-semibold">{room.meetPlace} · {room.meetTime}</dd>
        <RoomInfoKey icon={<CalendarDays size={13} />}>공연</RoomInfoKey>
        <dd className="font-semibold">{concertTitle}</dd>
        <RoomInfoKey icon={<Tag size={13} />}>방 태그</RoomInfoKey>
        <dd className="flex flex-wrap gap-1.5">
          {room.tags.map((tag) => (
            <Badge key={tag} tone={tagTone}>
              {tag}
            </Badge>
          ))}
        </dd>
        {room.status !== "host" ? (
          <>
            <RoomInfoKey icon={<Users size={13} />}>방장</RoomInfoKey>
            <dd className="font-semibold">{room.hostNickname}</dd>
          </>
        ) : null}
        {room.status === "visitor" ? (
          <>
            <RoomInfoKey icon={<Check size={13} />}>매칭</RoomInfoKey>
            <dd className="flex items-center gap-2 font-semibold text-[var(--cb-yellow-2)]">
              <span>{Math.min(2, room.tags.length)}/{room.tags.length} match</span>
              <span className="text-[var(--cb-text-3)]">매칭률 {room.match}%</span>
            </dd>
          </>
        ) : null}
      </dl>
    </section>
  );
}

function RoomInfoKey({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <dt className="flex items-center gap-1.5 text-[var(--cb-text-3)]">
      {icon}
      {children}
    </dt>
  );
}

function SchedulePreview({ room }: { room: Room }) {
  return (
    <section aria-labelledby="room-schedule-preview">
      <h2 id="room-schedule-preview" className="mx-4 mb-3 mt-1 text-[15px] font-bold">
        간단한 일정 미리보기
      </h2>
      <div className="sched mx-4 overflow-hidden rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)]">
        {room.schedulePreview.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 border-b border-[var(--cb-line)] px-3.5 py-3 text-[13px] last:border-b-0",
              item.anchor && "bg-[var(--cb-yellow-dim)]"
            )}
          >
            <span
              className={cn(
                "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border border-[var(--cb-text-3)] text-[11px] font-bold text-[var(--cb-text-2)]",
                item.anchor && "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]"
              )}
            >
              {item.anchor ? <Lock size={12} /> : index + 1}
            </span>
            <span className={cn("min-w-0 flex-1 truncate", item.anchor && "font-bold text-[var(--cb-yellow-2)]")}>{item.label}</span>
            <span className="shrink-0 text-[11.5px] font-semibold text-[var(--cb-text-3)]">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApplicantSection({
  applicants,
  onApprove,
  onReject
}: {
  applicants: RoomApplicant[];
  onApprove: (applicant: RoomApplicant) => void;
  onReject: (applicant: RoomApplicant) => void;
}) {
  const [tagApplicant, setTagApplicant] = useState<RoomApplicant | null>(null);

  return (
    <>
      <section className="members mt-[18px] px-4" aria-labelledby="room-applicants">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 id="room-applicants" className="text-[14px] font-bold">
            승인 대기 {applicants.length}
          </h2>
          <span className="text-[11px] text-[var(--cb-text-3)]">방장만 보임</span>
        </div>
        <div className="rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] px-3.5">
          {applicants.length > 0 ? (
            applicants.map((applicant) => (
              <ApplicantRow
                key={applicant.id}
                applicant={applicant}
                onApprove={onApprove}
                onReject={onReject}
                onShowTags={() => setTagApplicant(applicant)}
              />
            ))
          ) : (
            <p className="py-4 text-center text-[12px] text-[var(--cb-text-3)]">대기 중인 신청자가 없습니다.</p>
          )}
        </div>
      </section>
      {tagApplicant ? <ApplicantTagsModal applicant={tagApplicant} onClose={() => setTagApplicant(null)} /> : null}
    </>
  );
}

function ApplicantRow({
  applicant,
  onApprove,
  onReject,
  onShowTags
}: {
  applicant: RoomApplicant;
  onApprove: (applicant: RoomApplicant) => void;
  onReject: (applicant: RoomApplicant) => void;
  onShowTags: () => void;
}) {
  const visibleTags = applicant.applicationTags.slice(0, 2);
  const hiddenTagCount = applicant.applicationTags.length - visibleTags.length;

  return (
    <div className="flex items-start gap-[11px] border-b border-[var(--cb-line)] py-[13px] last:border-b-0">
      <Avatar name={applicant.avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[13px] font-bold">{applicant.nickname}</span>
            <span className="ml-1.5 rounded-[var(--r-pill)] border border-[var(--cb-line)] px-1.5 py-px text-[10px] font-semibold text-[var(--cb-text-3)]">{applicant.profileLabel}</span>
          </div>
          <span className="shrink-0 text-[10.5px] text-[var(--cb-text-3)]">{applicant.appliedAgo}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.5] text-[var(--cb-text-2)]">&quot;{applicant.message}&quot;</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Badge key={tag} tone="yellow">
              {tag}
            </Badge>
          ))}
          {hiddenTagCount > 0 ? (
            <button
              aria-label={`${applicant.nickname} 신청 태그 전체 보기`}
              className="inline-flex items-center gap-1 rounded-[var(--r-pill)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-2.5 py-1 text-[11px] font-semibold text-[var(--cb-yellow-2)] transition hover:border-[var(--cb-yellow)] hover:bg-[rgba(253,190,13,.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cb-yellow-line)] active:scale-[0.96]"
              style={{ fontSize: 11, fontWeight: 600 }}
              type="button"
              onClick={onShowTags}
            >
              +{hiddenTagCount}
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          aria-label={`${applicant.nickname} 거절`}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)] transition duration-150 hover:bg-[rgba(255,107,91,.13)] hover:text-[var(--cb-danger)] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
          type="button"
          onClick={() => onReject(applicant)}
        >
          <X size={16} strokeWidth={2.4} />
        </button>
        <button
          aria-label={`${applicant.nickname} 승인`}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] transition duration-150 hover:bg-[var(--cb-yellow-2)] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
          type="button"
          onClick={() => onApprove(applicant)}
        >
          <Check size={16} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

function ApplicantTagsModal({ applicant, onClose }: { applicant: RoomApplicant; onClose: () => void }) {
  return (
    <Modal title={`${applicant.nickname}님의 신청 태그`} position="center" onClose={onClose}>
      <div className="flex flex-wrap gap-1.5 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] p-3">
        {applicant.applicationTags.map((tag) => (
          <Badge key={tag} tone="yellow">
            {tag}
          </Badge>
        ))}
      </div>
    </Modal>
  );
}

function MemberSection({ room, participants }: { room: Room; participants: RoomParticipant[] }) {
  const seatsLeft = Math.max(0, room.maxMembers - participants.length);
  const title =
    room.status === "visitor"
      ? `멤버 ${participants.length} / ${room.maxMembers} · 자리 ${seatsLeft} 남음`
      : `참여 멤버 ${participants.length}`;
  const description = room.status === "visitor" ? "공개 요약만 표시" : room.status === "pending" ? "신청자에게 닉네임만 공개" : `공통 관심 ${Math.max(...participants.map((member) => member.commonInterests), 0)}개`;

  return (
    <section className="members mt-[18px] px-4" aria-labelledby="room-members">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 id="room-members" className="text-[14px] font-bold">
          {title}
        </h2>
        <span className="text-[11px] text-[var(--cb-text-3)]">{description}</span>
      </div>
      <div className="rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] px-3.5">
        {participants.map((member) => (
          <RoomMemberRow key={member.id} member={member} compact={room.status === "visitor" || room.status === "pending"} />
        ))}
      </div>
    </section>
  );
}

function RoomMemberRow({ member, compact }: { member: RoomParticipant; compact: boolean }) {
  return (
    <div className="flex items-center gap-[11px] border-b border-[var(--cb-line)] py-[13px] last:border-b-0">
      <Avatar name={member.avatar || member.nickname} host={member.role === "host"} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13px] font-bold">{member.nickname}</span>
          {!compact ? <span className="shrink-0 rounded-[var(--r-pill)] border border-[var(--cb-line)] px-1.5 py-px text-[10px] font-semibold text-[var(--cb-text-3)]">{member.profileLabel}</span> : null}
        </div>
        {!compact ? <div className="mt-1 text-[11.5px] text-[var(--cb-text-3)]">공통 관심 {member.commonInterests}개</div> : null}
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-[var(--cb-text-3)]">{member.role === "host" ? "방장" : member.joinedLabel}</span>
    </div>
  );
}

function RoomBottomCta({ mode, detailHref }: { mode: RoomStatus; detailHref: string }) {
  if (mode === "pending") {
    return (
      <div className="sticky bottom-0 z-20 shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_22%)] p-4">
        <Button disabled type="button">
          방장의 승인을 기다리는 중이에요
        </Button>
        <p className="mt-[9px] text-center text-[11px] text-[var(--cb-text-3)]">승인되면 알림으로 알려드려요 · Timeline 진입 불가</p>
      </div>
    );
  }

  if (mode === "visitor") {
    return (
      <div className="sticky bottom-0 z-20 shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_22%)] p-4">
        <Button asChild>
          <Link href={`${detailHref}?modal=apply`}>
            <Plus size={18} />
            입장 신청
          </Link>
        </Button>
        <p className="mt-[9px] text-center text-[11px] text-[var(--cb-text-3)]">신청 메시지 한 줄 작성 모달이 열려요</p>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-20 shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_22%)] p-4">
      <Button asChild>
        <Link href="/timeline">
          <Clock3 size={18} />
          Open Timeline
        </Link>
      </Button>
      <p className="mt-[9px] text-center text-[11px] text-[var(--cb-text-3)]">
        {mode === "host" ? "방장은 항상 일정 화면에 진입 가능" : "승인 멤버는 일정 화면에 진입 가능"}
      </p>
    </div>
  );
}

function ApplicantDecisionModal({
  decision,
  onCancel,
  onConfirm
}: {
  decision: ApplicantDecision;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isApprove = decision.type === "approve";
  const title = isApprove ? "멤버 승인 확인" : "신청 거절 확인";
  const actionLabel = isApprove ? "승인하기" : "거절하기";

  return (
    <Modal title={title} position="center" onClose={onCancel}>
      <p className="text-[13px] leading-[1.6] text-[var(--cb-text-2)]">
        <b className="font-bold text-[var(--cb-text)]">{decision.applicant.nickname}</b>
        {isApprove ? " 님을 이 방 멤버로 승인할까요?" : " 님의 입장 신청을 거절할까요?"}
      </p>
      <p className="mt-2 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] p-3 text-[12px] leading-5 text-[var(--cb-text-3)]">
        &quot;{decision.applicant.message}&quot;
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          취소
        </Button>
        <Button variant={isApprove ? "primary" : "danger"} type="button" onClick={onConfirm}>
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}

function ApplyModal({ detailHref }: { detailHref: string }) {
  const [message, setMessage] = useState("");
  const length = Array.from(message).length;

  return (
    <Modal title="입장 신청 메시지" onClose={() => undefined}>
      <Input
        label="신청 메시지"
        multiline
        maxLength={60}
        placeholder="방장에게 보낼 한 줄 메시지"
        value={message}
        onChange={(event) => setMessage(Array.from(event.currentTarget.value).slice(0, 60).join(""))}
      />
      <div className="mt-1 flex justify-between text-[11px] text-[var(--cb-text-3)]">
        <span>최대 60자</span>
        <span>{length} / 60</span>
      </div>
      <p className="mt-3 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] p-3 text-[12px] leading-5 text-[var(--cb-yellow-2)]">
        닉네임 · 연령대 · 성별이 함께 전달돼요. 승인되기 전까지는 오픈채팅에 입장할 수 없어요.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link href={detailHref}>취소</Link>
        </Button>
        <Button asChild>
          <Link href="/rooms/pending">신청하기</Link>
        </Button>
      </div>
    </Modal>
  );
}

function OpenChatInfoModal({ room, onCopyNotice }: { room: Room; onCopyNotice: (message: string) => void }) {
  const copyOpenChatField = useCallback(async (value: string, successMessage: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        onCopyNotice("클립보드를 사용할 수 없는 환경이에요");
        return;
      }

      await navigator.clipboard.writeText(value);
      onCopyNotice(successMessage);
    } catch {
      onCopyNotice("복사에 실패했어요");
    }
  }, [onCopyNotice]);

  const copyRows = [
    {
      label: "링크",
      value: room.openChat.url,
      ariaLabel: "오픈채팅 링크 복사",
      successMessage: "링크를 복사했어요"
    },
    {
      label: "비밀번호",
      value: room.openChat.password,
      ariaLabel: "오픈채팅 비밀번호 복사",
      successMessage: "비밀번호를 복사했어요"
    }
  ];

  return (
    <Modal className="flex flex-col gap-4 p-5" hideHeader title="오픈채팅 정보" onClose={() => undefined} position="center">
      {(closeModal) => (
        <>
          <div className="flex items-center gap-3">
            <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] text-[var(--cb-yellow)]">
              <MessageCircle size={20} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold tracking-[-.01em]">오픈채팅 정보</h2>
              <p className="mt-[3px] text-[12px] text-[var(--cb-text-3)]">승인된 멤버만 볼 수 있어요</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {copyRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-2.5 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 py-3">
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold uppercase tracking-[.06em] text-[var(--cb-text-3)]">{row.label}</div>
                  <div className="mt-[3px] truncate text-[13.5px] font-semibold text-[var(--cb-text)] [font-family:var(--mono)]">{row.value}</div>
                </div>
                <button
                  aria-label={row.ariaLabel}
                  className="h-[34px] shrink-0 rounded-[var(--r-sm)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-3 text-[12px] font-bold text-[var(--cb-yellow-2)] transition duration-150 hover:border-[var(--cb-yellow)] hover:bg-[rgba(253,190,13,.22)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
                  type="button"
                  onClick={() => void copyOpenChatField(row.value, row.successMessage)}
                >
                  복사
                </button>
              </div>
            ))}
          </div>

          <p className="rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3 py-[11px] text-[11.5px] leading-[1.55] text-[var(--cb-text-2)]">
            오픈채팅 정보는 외부에 공유하지 말아주세요. 승인되지 않은 사람의 입장으로 이어질 수 있어요.
          </p>

          <div className="flex gap-2.5">
            <Button className="h-[50px] text-[14px]" variant="outline" type="button" onClick={closeModal}>
              닫기
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function RoomToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="profile-toast pointer-events-none fixed bottom-[76px] left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[rgba(22,22,24,.96)] px-3.5 py-3 text-[12px] font-semibold text-[var(--cb-yellow-2)] shadow-[var(--sh-pop)] backdrop-blur"
    >
      {message}
    </div>
  );
}
