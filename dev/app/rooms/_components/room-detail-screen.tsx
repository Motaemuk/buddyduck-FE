"use client";

import Link from "next/link";
import { Lock, MessageCircle } from "lucide-react";
import { AppBar, Avatar, Button, Card, Input, Modal } from "@/components/ui";
import { BackButton, Badge, InfoRow, MemberRow, SectionTitle, TimelineBlock } from "../../_components/buddy-patterns";
import { getConcert, members, rooms as fallbackRooms, timetableStops, type RoomStatus } from "@/lib/data";
import { modeLabel } from "../_lib/room-labels";

export function RoomDetailScreen({
  mode,
  showApplyModal = false,
  showOpenChatModal = false
}: {
  mode: RoomStatus;
  showApplyModal?: boolean;
  showOpenChatModal?: boolean;
}) {
  const room = fallbackRooms.find((item) => item.status === mode) ?? fallbackRooms[0];
  const concert = getConcert(room.concertId);
  const detailHref = `/rooms/${mode === "host" ? "host" : mode === "member" ? "member" : mode === "pending" ? "pending" : "visitor"}`;
  const canOpenChat = mode === "host" || mode === "member";

  return (
    <>
      <AppBar
        title={room.title}
        left={<BackButton href="/rooms" />}
        right={
          mode === "host" || mode === "member" ? (
            <Link href={`${detailHref}?modal=open-chat`} className="inline-flex h-[34px] items-center gap-1.5 rounded-[var(--r-pill)] bg-[var(--cb-yellow)] px-3 text-[12px] font-bold text-[var(--cb-on-yellow)]">
              <MessageCircle size={15} /> 오픈채팅
            </Link>
          ) : mode === "visitor" ? (
            null
          ) : mode === "pending" ? (
            null
          ) : null
        }
      />
      <div className="body-scroll">
        <Badge tone="yellow">{modeLabel(mode)}</Badge>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={room.hostAvatar} host />
              <div>
                <div className="text-[13px] font-semibold">{room.hostNickname}</div>
                <div className="text-[11px] text-[var(--cb-text-3)]">매칭률 {room.match}%</div>
              </div>
            </div>
            <Badge>
              {room.isLocked ? <Lock size={12} /> : null}
              {room.currentMembers}/{room.maxMembers}
            </Badge>
          </div>
          <h1 className="mt-4 text-[19px] font-bold leading-7 text-balance">{room.title}</h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.tags.map((tag) => (
              <Badge key={tag} tone="yellow">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
        <SectionTitle title="콘서트 정보" />
        <Card className="p-4">
          <div className="text-[15px] font-bold">{concert.artist}</div>
          <div className="mt-1 text-[13px] text-[var(--cb-text-2)]">{concert.title}</div>
          <div className="mt-3 grid gap-2 text-[12px] text-[var(--cb-text-3)]">
            <InfoRow label="날짜" value={concert.date} />
            <InfoRow label="장소" value={concert.venue} />
          </div>
        </Card>
        <SectionTitle title="멤버" />
        <div className="space-y-2">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
        <SectionTitle title="동행 일정" />
        <TimelineBlock stops={timetableStops} detailed />
        {mode === "pending" ? (
          <Card className="mt-4 border-[rgba(253,190,13,.24)] bg-[var(--cb-yellow-dim)] text-[12px] leading-5 text-[var(--cb-yellow-2)]">
            <b>신청 대기 중</b>
            <br />
            호스트가 수락하면 오픈채팅과 일정표가 열립니다.
          </Card>
        ) : null}
      </div>
      {mode === "host" ? (
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_20%)] p-4">
          <Button variant="outline">방 공유</Button>
          <Link href="/timeline">
            <Button>Open Timeline</Button>
          </Link>
        </div>
      ) : null}
      {mode === "member" ? (
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_20%)] p-4">
          <Link href="/timeline">
            <Button>Open Timeline</Button>
          </Link>
          <Button variant="danger">탈퇴</Button>
        </div>
      ) : null}
      {mode === "pending" ? (
        <div className="shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_20%)] p-4">
          <Link href="/rooms">
            <Button variant="outline">신청 취소</Button>
          </Link>
        </div>
      ) : null}
      {mode === "visitor" ? (
        <div className="shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_20%)] p-4">
          <Link href="/rooms/visitor?modal=apply">
            <Button>동행 신청하기</Button>
          </Link>
        </div>
      ) : null}
      {showApplyModal ? <ApplyModal /> : null}
      {canOpenChat && showOpenChatModal ? <OpenChatInfoModal /> : null}
    </>
  );
}

function OpenChatInfoModal() {
  return (
    <Modal title="오픈채팅 정보" onClose={() => undefined}>
      <div className="rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3 text-[12px] leading-5">
        <InfoRow label="링크" value="open.kakao.com/o/aBcD9XyZ" strong />
        <InfoRow label="비밀번호" value="2468" />
      </div>
      <p className="mt-3 text-[12px] leading-5 text-[var(--cb-text-2)]">
        승인된 멤버만 볼 수 있어요. 오픈채팅 정보는 외부에 공유하지 말아주세요.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" type="button">복사</Button>
        <Button type="button">카카오톡 열기</Button>
      </div>
    </Modal>
  );
}

function ApplyModal() {
  return (
    <Modal title="동행 신청" onClose={() => undefined}>
      <Input multiline placeholder="호스트에게 보낼 짧은 메시지" defaultValue="굿즈 줄과 카페 일정 모두 함께하고 싶어요." />
      <div className="mt-3 flex gap-2">
        <Link href="/rooms/visitor" className="flex-1">
          <Button variant="outline">취소</Button>
        </Link>
        <Link href="/rooms/pending" className="flex-1">
          <Button>신청하기</Button>
        </Link>
      </div>
    </Modal>
  );
}
