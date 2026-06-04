"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Star,
  X
} from "lucide-react";
import { addMinutes, format } from "date-fns";
import { ko } from "date-fns/locale";
import { useConcerts, useCreateRoomMutation, useRooms } from "@/lib/api";
import {
  calculateTimetableLoad,
  concerts as fallbackConcerts,
  memories,
  myProfile,
  places,
  rooms as fallbackRooms,
  tags,
  timetableStops,
  type Room
} from "@/lib/data";
import { getKakaoMapKey, loadKakaoMap, type KakaoMapState } from "@/lib/kakao-map";
import { type AppScreen, getScreenById, SCREEN_ROUTES } from "@/lib/routes";
import { useAppStore } from "@/store/app-store";
import { AppBar, Avatar, Button, Card, Chip, Input, Modal, Stepper } from "@/components/ui";
import { MobileShell } from "@/components/shell";
import { cn } from "@/lib/utils";

const nicknameSchema = z.object({
  nickname: z.string().min(2, "두 글자 이상 입력해 주세요").max(12, "12자 이하로 입력해 주세요")
});

const roomSchema = z.object({
  title: z.string().min(5, "방 제목을 조금 더 구체적으로 적어 주세요"),
  intro: z.string().min(10, "소개는 10자 이상 필요해요")
});

const profileSchema = z.object({
  nickname: z.string().min(2, "닉네임을 확인해 주세요"),
  intro: z.string().min(5, "소개를 입력해 주세요")
});

export function BuddyDuckApp({ screen }: { screen: AppScreen }) {
  const showNav = Boolean(screen.nav) && !["CB-01", "CB-02"].includes(screen.id);

  return (
    <MobileShell screen={screen} showNav={showNav}>
      <ScreenContent screen={screen} />
    </MobileShell>
  );
}

function ScreenContent({ screen }: { screen: AppScreen }) {
  switch (screen.id) {
    case "CB-01":
      return <LoginScreen />;
    case "CB-02":
      return <NicknameScreen />;
    case "CB-03":
      return <HomeScreen />;
    case "CB-04":
      return <RoomListScreen />;
    case "CB-04prime":
      return <RoomListScreen showTagModal />;
    case "CB-05":
      return <CreateRoomScreen />;
    case "CB-06":
      return <MyRoomsScreen />;
    case "CB-07A":
      return <RoomDetailScreen mode="host" />;
    case "CB-07B":
      return <RoomDetailScreen mode="member" />;
    case "CB-07C":
      return <RoomDetailScreen mode="pending" />;
    case "CB-07D":
      return <RoomDetailScreen mode="visitor" />;
    case "CB-07Dprime":
      return <RoomDetailScreen mode="visitor" showApplyModal />;
    case "CB-08":
      return <OpenChatScreen />;
    case "CB-09":
      return <TimelineScreen />;
    case "CB-10":
      return <PlaceSearchScreen />;
    case "CB-11":
      return <TimetableEditScreen />;
    case "CB-11prime":
      return <TimetableEditScreen showWarning />;
    case "CB-12":
      return <MapScreen />;
    case "CB-13":
      return <MemoryFeedScreen />;
    case "CB-14":
      return <ProfileScreen />;
    case "CB-14prime":
      return <ProfileEditScreen />;
  }
}

function LoginScreen() {
  return (
    <>
      <div className="flex flex-1 flex-col px-6 pb-5 pt-12">
        <div className="mb-8 grid h-24 w-24 place-items-center rounded-[28px] bg-[var(--cb-yellow)] text-[42px] font-black text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)]">
          BD
        </div>
        <div className="mt-2">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--cb-yellow)]">Concert Buddy</p>
          <h1 className="mt-3 text-[30px] font-black leading-tight tracking-normal">콘서트 전후 일정까지 맞는 동행을 찾아요</h1>
          <p className="mt-4 text-[13px] leading-6 text-[var(--cb-text-2)]">
            관심 태그, 이동 방식, 일정 성향을 기반으로 공연장 주변 동행 방을 탐색합니다.
          </p>
        </div>
        <div className="mt-auto space-y-3">
          <Link href="/nickname">
            <Button variant="kakao">
              <MessageCircle size={19} /> 카카오로 계속하기
            </Button>
          </Link>
          <p className="text-center text-[11px] leading-5 text-[var(--cb-text-3)]">
            API 연결 전 정적 프로토타입입니다. 로그인 버튼은 닉네임 설정 화면으로 이동합니다.
          </p>
        </div>
      </div>
    </>
  );
}

function NicknameScreen() {
  const {
    register,
    control,
    formState: { errors, isValid }
  } = useForm<z.infer<typeof nicknameSchema>>({
    resolver: zodResolver(nicknameSchema),
    mode: "onChange",
    defaultValues: { nickname: "duck_moon" }
  });
  const nicknameLength = useWatch({ control, name: "nickname" })?.length ?? 0;

  return (
    <>
      <AppBar title="프로필 시작" left={<BackButton href="/login" />} />
      <div className="body-scroll flex flex-col">
        <div className="pt-8">
          <h1 className="text-[21px] font-bold">어떤 이름으로 불릴까요?</h1>
          <p className="mt-2 text-[13px] leading-6 text-[var(--cb-text-2)]">방 신청과 오픈채팅 안내에 표시됩니다.</p>
        </div>
        <div className="mt-8">
          <Input label="닉네임" placeholder="닉네임 입력" error={errors.nickname?.message} {...register("nickname")} />
          <div className="mt-2 text-right text-[11px] text-[var(--cb-text-3)]">{nicknameLength}/12</div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["굿즈", "사진", "20대", "같이입장"].map((tag) => (
            <Chip key={tag} active>
              {tag}
            </Chip>
          ))}
        </div>
        <div className="mt-auto pt-6">
          <Link href="/home">
            <Button disabled={!isValid} className={!isValid ? "bg-[var(--cb-surface-2)] text-[var(--cb-text-3)] shadow-none" : ""}>
              시작하기
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

function HomeScreen() {
  const { data } = useConcerts();
  const concertData = data ?? fallbackConcerts;

  return (
    <>
      <AppBar
        left={<div className="text-[21px] font-bold">Buddy Duck</div>}
        right={
          <Button size="icon" variant="outline" aria-label="알림">
            <Bell size={18} />
          </Button>
        }
      />
      <div className="body-scroll">
        <section className="rounded-[var(--r-lg)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--cb-yellow)]">Next Concert</p>
          <h1 className="mt-2 text-[21px] font-bold leading-tight">Moonlight Sync Live</h1>
          <p className="mt-1 text-[12.5px] text-[var(--cb-text-2)]">2026.06.15 · KSPO Dome · D-11</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-[var(--cb-text-3)]">
            {["동행방 32", "매칭률 96%", "일정 4개"].map((item) => (
              <div key={item} className="rounded-[var(--r-sm)] bg-[var(--cb-surface-2)] px-2 py-2 font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>
        <SectionTitle title="트렌딩 태그" />
        <div className="-mx-1 flex gap-2 overflow-auto px-1">
          {tags.slice(0, 7).map((tag, index) => (
            <Chip key={tag} active={index < 3}>
              #{tag}
            </Chip>
          ))}
        </div>
        <SectionTitle title="다가오는 공연" />
        <div className="space-y-3">
          {concertData.map((concert) => (
            <Link key={concert.id} href="/rooms" className="flex gap-3 rounded-[var(--r-lg)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] p-3 shadow-[var(--sh-card)]">
              <div className="ph h-[72px] w-[72px] rounded-[var(--r-md)]" />
              <div className="min-w-0 flex-1 py-1">
                <h2 className="truncate text-[15px] font-bold">{concert.title}</h2>
                <p className="mt-1 text-[12.5px] text-[var(--cb-text-2)]">{concert.artist} · {concert.venue}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[var(--cb-text-3)]">
                  <CalendarDays size={14} /> <b className="text-[var(--cb-yellow)]">{concert.dday}</b> · 동행 {concert.buddies}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function RoomListScreen({ showTagModal = false }: { showTagModal?: boolean }) {
  const { data } = useRooms();
  const roomData = data ?? fallbackRooms;
  const { selectedTags, toggleTag } = useAppStore();

  return (
    <>
      <AppBar
        title="동행 방"
        left={<BackButton href="/home" />}
        right={
          <Link href="/rooms/create">
            <Button size="icon" variant="outline" aria-label="방 만들기">
              <Plus size={18} />
            </Button>
          </Link>
        }
      />
      <div className="ph h-[140px]">
        <div className="absolute inset-x-4 bottom-5">
          <h1 className="text-[17px] font-bold">Moonlight Sync Live</h1>
          <p className="mt-1 text-[12px] text-[var(--cb-text-2)]">KSPO Dome · <b className="text-[var(--cb-yellow)]">D-11</b></p>
        </div>
      </div>
      <div className="relative z-10 mx-4 -mt-3 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[var(--cb-surface-1)] p-3 shadow-[var(--sh-card)]">
        <div className="flex items-center justify-between text-[12.5px] font-semibold">
          내 태그
          <Link href="/rooms?modal=tags" className="flex items-center gap-1 text-[12px] text-[var(--cb-yellow)]">
            <Filter size={14} /> 편집
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
      <div className="body-scroll pt-4">
        <div className="mb-3 flex gap-2 overflow-auto">
          {["추천순", "빈자리", "내 태그", "신규"].map((item, index) => (
            <Chip key={item} active={index === 0}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="space-y-3">
          {roomData.map((room) => (
            <RoomCard key={room.id} room={room} href={roomHref(room)} />
          ))}
        </div>
      </div>
      {showTagModal ? (
        <Modal title="관심 태그 조정" onClose={() => undefined}>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip key={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                {tag}
              </Chip>
            ))}
          </div>
          <Link href="/rooms" className="mt-4 block">
            <Button>필터 적용</Button>
          </Link>
        </Modal>
      ) : null}
    </>
  );
}

function CreateRoomScreen() {
  const mutation = useCreateRoomMutation();
  const [selected, setSelected] = useState(["굿즈", "사진"]);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    mode: "onChange",
    defaultValues: { title: "굿즈 줄 같이 서고 공연 전 카페까지", intro: "공연 전 굿즈 수령 후 카페에서 쉬다가 같이 입장해요." }
  });

  return (
    <>
      <AppBar title="방 개설" left={<BackButton href="/rooms" />} />
      <form
        className="body-scroll flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate({ title: values.title, tags: selected }))}
      >
        <Input label="방 제목" error={errors.title?.message} {...register("title")} />
        <Input label="소개" multiline error={errors.intro?.message} {...register("intro")} />
        <div>
          <div className="mb-2 text-[12.5px] font-semibold text-[var(--cb-text-2)]">모집 태그</div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 8).map((tag) => (
              <Chip
                key={tag}
                active={selected.includes(tag)}
                onClick={() => setSelected((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))}
                type="button"
              >
                {tag}
              </Chip>
            ))}
          </div>
        </div>
        <Card className="text-[12px] leading-5 text-[var(--cb-text-2)]">
          저장 시 API mutation 경계를 거치도록 구성했습니다. 현재는 mock invalidate만 수행합니다.
        </Card>
        <div className="mt-auto">
          <Button disabled={!isValid}>{mutation.isPending ? "저장 중" : "방 만들기"}</Button>
        </div>
      </form>
    </>
  );
}

function MyRoomsScreen() {
  return (
    <>
      <AppBar title="내 방" left={<BackButton href="/home" />} />
      <div className="body-scroll">
        <div className="grid grid-cols-3 gap-2">
          {[
            ["호스트", "1"],
            ["참여중", "1"],
            ["대기", "1"]
          ].map(([label, count]) => (
            <Card key={label} className="p-3 text-center">
              <div className="text-[20px] font-black text-[var(--cb-yellow)]">{count}</div>
              <div className="text-[11px] font-semibold text-[var(--cb-text-3)]">{label}</div>
            </Card>
          ))}
        </div>
        <SectionTitle title="진행 중인 방" />
        <div className="space-y-3">
          {fallbackRooms.map((room) => (
            <RoomCard key={room.id} room={room} href={roomHref(room)} compact />
          ))}
        </div>
      </div>
    </>
  );
}

function RoomDetailScreen({ mode, showApplyModal = false }: { mode: Room["role"]; showApplyModal?: boolean }) {
  const room = fallbackRooms.find((item) => item.role === mode) ?? fallbackRooms[0];
  const action = {
    host: "신청자 관리",
    member: "오픈채팅 열기",
    pending: "신청 취소",
    visitor: "동행 신청"
  }[mode];
  const href = mode === "visitor" ? "/rooms/visitor?modal=apply" : mode === "member" ? "/open-chat" : "/timeline";

  return (
    <>
      <AppBar
        title={modeLabel(mode)}
        left={<BackButton href="/rooms" />}
        right={
          <Button size="icon" variant="outline" aria-label="더보기">
            <MoreHorizontal size={18} />
          </Button>
        }
      />
      <div className="body-scroll">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={room.host} host />
              <div>
                <div className="text-[13px] font-semibold">{room.host}</div>
                <div className="text-[11px] text-[var(--cb-text-3)]">매칭률 {room.match}%</div>
              </div>
            </div>
            <Badge>{room.people}</Badge>
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
        <SectionTitle title="동행 일정" />
        <TimelinePreview />
        <SectionTitle title="멤버" />
        <div className="space-y-2">
          {["moon_armies", "soobin_d", "starlight_o"].map((name, index) => (
            <div key={name} className="flex items-center gap-2 rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3">
              <Avatar name={name} host={index === 0} />
              <div className="flex-1 text-[13px] font-semibold">{name}</div>
              <Badge>{index === 0 ? "HOST" : "MEMBER"}</Badge>
            </div>
          ))}
        </div>
        {mode === "pending" ? (
          <Card className="mt-4 border-[rgba(253,190,13,.24)] bg-[var(--cb-yellow-dim)] text-[12px] leading-5 text-[var(--cb-yellow-2)]">
            호스트 수락 전입니다. 수락되면 오픈채팅과 일정 편집이 열립니다.
          </Card>
        ) : null}
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_20%)] p-4">
        <Link href={href}>
          <Button variant={mode === "pending" ? "outline" : "primary"}>{action}</Button>
        </Link>
      </div>
      {showApplyModal ? <ApplyModal /> : null}
    </>
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
          <Button>신청 보내기</Button>
        </Link>
      </div>
    </Modal>
  );
}

function OpenChatScreen() {
  const messages = [
    ["moon_armies", "굿즈 라인은 14:20쯤 도착하면 괜찮을 것 같아요."],
    ["soobin_d", "카페 예약 가능하면 제가 확인해볼게요."],
    ["me", "좋아요. 일정표에 장소 추가해둘게요."]
  ];

  return (
    <>
      <AppBar title="오픈채팅" left={<BackButton href="/rooms/member" />} right={<Badge tone="yellow">연결됨</Badge>} />
      <div className="body-scroll flex flex-col gap-3">
        {messages.map(([name, message]) => (
          <div key={message} className={cn("flex gap-2", name === "me" && "justify-end")}>
            {name !== "me" ? <Avatar name={name} /> : null}
            <div
              className={cn(
                "max-w-[238px] rounded-[18px] px-3.5 py-2.5 text-[13px] leading-5",
                name === "me" ? "bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]" : "bg-[var(--cb-surface-2)]"
              )}
            >
              {message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 gap-2 border-t border-[var(--cb-line)] p-3">
        <div className="flex min-h-[44px] flex-1 items-center rounded-[var(--r-pill)] bg-[var(--cb-surface-2)] px-4 text-[13px] text-[var(--cb-text-3)]">
          메시지 입력
        </div>
        <Button size="icon" aria-label="전송">
          <Send size={18} />
        </Button>
      </div>
    </>
  );
}

function TimelineScreen() {
  return (
    <>
      <AppBar
        title="타임라인"
        left={<BackButton href="/my-rooms" />}
        right={
          <Link href="/map">
            <Button size="icon" variant="outline" aria-label="지도">
              <MapPin size={18} />
            </Button>
          </Link>
        }
      />
      <div className="body-scroll">
        <div className="mb-3 flex items-center justify-between rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3">
          <div>
            <div className="text-[13px] font-bold">2026.06.15 (월)</div>
            <div className="text-[11px] text-[var(--cb-text-3)]">공연 시작 19:00 기준 자동 역산</div>
          </div>
          <Link href="/timetable" className="text-[12px] font-bold text-[var(--cb-yellow)]">
            수정
          </Link>
        </div>
        <TimelinePreview detailed />
      </div>
    </>
  );
}

function PlaceSearchScreen() {
  const [added, setAdded] = useState<string[]>([]);

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
                onClick={() => setAdded((current) => [...current, place.name])}
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

function TimetableEditScreen({ showWarning = false }: { showWarning?: boolean }) {
  const [extra, setExtra] = useState(showWarning ? 42 : 0);
  const load = calculateTimetableLoad(timetableStops, extra);

  return (
    <>
      <AppBar
        title="일정 수정"
        left={<BackButton href="/timeline" icon="close" />}
        right={<button className="text-[13px] font-semibold text-[var(--cb-yellow)]">초기화</button>}
      />
      <div className="px-4 py-3">
        <div className="text-[13px] font-bold">2026.06.15 (월) - D-Day</div>
        <div className="text-[11px] text-[var(--cb-text-3)]">장소 블록 · 이동 블록 · 잠긴 공연 블록</div>
      </div>
      <div className="body-scroll">
        <div className="space-y-2">
          {timetableStops.map((stop) => (
            <div key={stop.id}>
              <Card className={cn("p-0", stop.category === "공연" && "border-[var(--cb-yellow-line)]")}>
                <div className="flex items-center gap-2 p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--cb-yellow)] text-[12px] font-black text-[var(--cb-on-yellow)]">
                    {stop.category === "공연" ? <Star size={14} fill="currentColor" /> : stop.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold">
                      {stop.title} {stop.category === "공연" ? <Lock className="inline" size={13} /> : null}
                    </div>
                    <div className="text-[11px] text-[var(--cb-text-3)]">{stop.time}</div>
                  </div>
                  <Stepper value={stop.category === "공연" ? "30분" : `${stop.dwellMinutes}분`} />
                </div>
              </Card>
              {stop.routeMinutes > 0 ? (
                <div className="mx-4 my-1 flex items-center justify-between rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3 py-2 text-[12px] text-[var(--cb-text-2)]">
                  <span>{stop.routeMode} 이동</span>
                  <Stepper value={`${stop.routeMinutes}분`} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <Link href="/places" className="mt-3 block">
          <Button variant="outline">
            <Plus size={18} /> 장소 추가
          </Button>
        </Link>
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] p-4">
        <div className="mb-2 text-[11px] text-[var(--cb-text-3)]">
          총 소요 {load.usedMinutes}분 · 사용 가능 {load.availableMinutes}분
        </div>
        <Link href={load.isOverTime ? "/timetable?modal=warning" : "/timeline"} onClick={() => setExtra(42)}>
          <Button>수정 완료</Button>
        </Link>
      </div>
      {showWarning ? <OverTimeModal load={load} /> : null}
    </>
  );
}

function OverTimeModal({ load }: { load: ReturnType<typeof calculateTimetableLoad> }) {
  return (
    <Modal title="지금 일정을 전부 소화할 수 없습니다" position="center" onClose={() => undefined}>
      <div className="rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3 text-[12px]">
        <InfoRow label="사용 가능 시간" value="14:00 - 18:30 · 4h 30m" />
        <InfoRow label="현재 일정 총 소요" value={`${load.usedMinutes}분`} />
        <InfoRow label="초과 시간" value={`+ ${load.overMinutes}분`} strong />
      </div>
      <p className="mt-3 text-[12px] leading-5 text-[var(--cb-text-2)]">장소를 줄이거나 체류 시간을 줄여 주세요. 저장은 차단됩니다.</p>
      <Link href="/timetable" className="mt-4 block">
        <Button>되돌아가서 수정</Button>
      </Link>
    </Modal>
  );
}

function MapScreen() {
  const [state, setState] = useState<KakaoMapState>("loading");
  const { selectedMapStop, setSelectedMapStop } = useAppStore();
  const selected = timetableStops.find((stop) => stop.id === selectedMapStop) ?? timetableStops[1];

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
            <button
              key={id}
              className={cn(
                "absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[12px] font-black",
                selectedMapStop === id ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]" : "border-[var(--cb-bg)] bg-[var(--cb-surface-3)]"
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
              onClick={() => setSelectedMapStop(Number(id))}
              type="button"
            >
              {id === 4 ? <Star size={14} fill="currentColor" /> : id}
            </button>
          ))}
        </div>
        <div className="absolute left-4 right-4 top-3 flex gap-2">
          <Chip active>D-Day</Chip>
          <Chip>D+1</Chip>
        </div>
        {state !== "ready" ? (
          <div className="absolute inset-x-4 top-16 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[rgba(22,22,24,.88)] p-3 text-[11px] leading-5 text-[var(--cb-text-2)] backdrop-blur">
            Kakao Maps fallback · {getKakaoMapKey() ? "스크립트 로딩 중 또는 실패" : "NEXT_PUBLIC_KAKAO_MAP_KEY 미설정"}
          </div>
        ) : null}
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] p-4">
        <Card className="flex gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cb-yellow)] text-[12px] font-black text-[var(--cb-on-yellow)]">
            {selected.id}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{selected.title}</div>
            <div className="mt-1 text-[11px] text-[var(--cb-text-2)]">{selected.category} · Kakao fallback</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--cb-text-3)]">
              <Clock3 size={13} /> {selected.time}
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--cb-text-3)]" />
        </Card>
      </div>
    </>
  );
}

function MemoryFeedScreen() {
  return (
    <>
      <AppBar
        title="우리 방 추억"
        left={<BackButton href="/timeline" />}
        right={
          <Button size="icon" variant="outline" aria-label="더보기">
            <MoreHorizontal size={18} />
          </Button>
        }
      />
      <div className="flex items-center justify-between border-y border-[var(--cb-line)] px-4 py-3">
        <Badge tone="yellow">그룹</Badge>
        <span className="text-[11px] text-[var(--cb-text-3)]">사진 12 · 영상 3</span>
      </div>
      <div className="body-scroll">
        <div className="space-y-4">
          {memories.map((group) => (
            <Card key={group.stop}>
              <div className="mb-3 flex items-center gap-2">
                <Badge tone="yellow">{group.stop.slice(0, 2)}</Badge>
                <div>
                  <div className="text-[13px] font-bold">{group.stop}</div>
                  <div className="text-[11px] text-[var(--cb-text-3)]">{group.time}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {group.media.map((media, index) => (
                  <div key={`${media}-${index}`} className="ph grid aspect-square place-items-center rounded-[var(--r-sm)] text-[10px] font-bold text-white/50">
                    {media === "+" ? <Plus size={22} /> : media}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-[var(--cb-text-3)]">{group.by} · 06.15</div>
            </Card>
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] p-3">
        <div className="mb-2 flex gap-2 text-[11px] text-[var(--cb-text-2)]">
          <Badge><Camera size={13} /> 사진</Badge>
          <Badge>VIDEO ≤60s</Badge>
        </div>
        <Button>
          <Plus size={18} /> 업로드
        </Button>
      </div>
    </>
  );
}

function ProfileScreen() {
  return (
    <>
      <AppBar title="프로필" right={<Link href="/profile/edit" className="text-[13px] font-semibold text-[var(--cb-yellow)]">수정</Link>} />
      <div className="body-scroll">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Avatar name={myProfile.nickname} host />
            <div>
              <h1 className="text-[18px] font-bold">{myProfile.nickname}</h1>
              <p className="text-[12px] text-[var(--cb-text-3)]">{myProfile.age} · {myProfile.gender}</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-6 text-[var(--cb-text-2)]">{myProfile.intro}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {myProfile.preferredTags.map((tag) => (
              <Badge key={tag} tone="yellow">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
        <SectionTitle title="활동" />
        <div className="grid grid-cols-3 gap-2">
          {[
            ["참여", "8"],
            ["추억", "36"],
            ["평점", "4.9"]
          ].map(([label, value]) => (
            <Card key={label} className="text-center">
              <div className="text-[20px] font-black text-[var(--cb-yellow)]">{value}</div>
              <div className="text-[11px] text-[var(--cb-text-3)]">{label}</div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function ProfileEditScreen() {
  const {
    register,
    formState: { errors, isValid }
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { nickname: myProfile.nickname, intro: myProfile.intro }
  });

  return (
    <>
      <AppBar title="프로필 편집" left={<BackButton href="/profile" />} />
      <form className="body-scroll flex flex-col gap-4">
        <div className="flex justify-center py-4">
          <div className="relative">
            <Avatar name={myProfile.nickname} host />
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]">
              <Pencil size={13} />
            </span>
          </div>
        </div>
        <Input label="닉네임" error={errors.nickname?.message} {...register("nickname")} />
        <Input label="소개" multiline error={errors.intro?.message} {...register("intro")} />
        <div>
          <div className="mb-2 text-[12.5px] font-semibold text-[var(--cb-text-2)]">선호 태그</div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 8).map((tag) => (
              <Chip key={tag} active={myProfile.preferredTags.includes(tag)}>
                {tag}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <Link href="/profile">
            <Button disabled={!isValid}>저장</Button>
          </Link>
        </div>
      </form>
    </>
  );
}

function RoomCard({ room, href, compact = false }: { room: Room; href: string; compact?: boolean }) {
  return (
    <Link href={href} className="block">
      <Card className={cn("transition hover:border-[var(--cb-line-2)]", room.status === "full" && "opacity-60")}>
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={room.host} host={room.role === "host"} />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">{room.host}</div>
              <div className="text-[11px] text-[var(--cb-text-3)]">매칭률 {room.match}%</div>
            </div>
          </div>
          <Badge tone={room.status === "full" ? "muted" : "yellow"}>{room.people}</Badge>
        </div>
        <h2 className={cn("mt-3 font-bold leading-6", compact ? "text-[14px]" : "text-[15px]")}>{room.title}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}

function TimelinePreview({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="space-y-2">
      {timetableStops.map((stop, index) => (
        <div key={stop.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--cb-yellow)] text-[12px] font-black text-[var(--cb-on-yellow)]">
              {stop.category === "공연" ? <Star size={13} fill="currentColor" /> : stop.id}
            </span>
            {index < timetableStops.length - 1 ? <span className="h-10 w-px bg-[var(--cb-line-2)]" /> : null}
          </div>
          <div className="min-w-0 flex-1 rounded-[var(--r-md)] bg-[var(--cb-surface-2)] p-3">
            <div className="flex justify-between gap-2">
              <div className="truncate text-[13px] font-bold">{stop.title}</div>
              <div className="shrink-0 text-[11px] font-semibold text-[var(--cb-yellow)]">{stop.time}</div>
            </div>
            {detailed ? (
              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--cb-text-3)]">
                <span>{stop.category}</span>
                <span>{stop.routeMode !== "잠금" ? `${stop.routeMode} ${stop.routeMinutes}분` : "공연 시간 잠김"}</span>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Badge({
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

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-3 mt-5 text-[15px] font-bold">{title}</h2>;
}

function BackButton({ href, icon = "back" }: { href: string; icon?: "back" | "close" }) {
  return (
    <Link
      href={href}
      className="grid h-[38px] w-[38px] place-items-center rounded-full border border-[var(--cb-line)] bg-[var(--cb-surface-2)]"
      aria-label="뒤로"
    >
      {icon === "close" ? <X size={20} /> : <ArrowLeft size={20} />}
    </Link>
  );
}

function InfoRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between py-1.5", strong && "text-[15px] font-black text-[var(--cb-yellow)]")}>
      <span className="text-[var(--cb-text-3)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function roomHref(room: Room) {
  if (room.role === "host") return "/rooms/host";
  if (room.role === "member") return "/rooms/member";
  if (room.role === "pending") return "/rooms/pending";
  return "/rooms/visitor";
}

function modeLabel(mode: Room["role"]) {
  return {
    host: "호스트 뷰",
    member: "멤버 뷰",
    pending: "신청 대기",
    visitor: "방문자 뷰"
  }[mode];
}

export function ScreenIndex() {
  const today = useMemo(() => format(addMinutes(new Date("2026-06-15T14:00:00"), 0), "yyyy.MM.dd (eee)", { locale: ko }), []);

  return (
    <div>
      <div>{today}</div>
      {SCREEN_ROUTES.map((screen) => (
        <Link key={screen.id} href={screen.href}>
          {screen.label} {screen.name}
        </Link>
      ))}
      <span>{getScreenById("CB-01").name}</span>
    </div>
  );
}
