export type Concert = {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  dday: string;
  buddies: number;
  tags: string[];
};

export type Room = {
  id: string;
  title: string;
  host: string;
  role: "host" | "member" | "pending" | "visitor";
  status: "open" | "full" | "ready";
  match: number;
  people: string;
  tags: string[];
};

export type TimetableStop = {
  id: number;
  title: string;
  category: string;
  time: string;
  dwellMinutes: number;
  routeMinutes: number;
  routeMode: "도보" | "택시" | "잠금";
};

export const tags = ["같이입장", "굿즈", "사진", "택시", "20대", "느긋한", "여성만", "첫콘", "맛집"];

export const concerts: Concert[] = [
  {
    id: "c1",
    title: "Moonlight Sync Live",
    artist: "LUMINA",
    venue: "KSPO Dome",
    date: "2026.06.15",
    dday: "D-11",
    buddies: 128,
    tags: ["굿즈", "사진", "같이입장"]
  },
  {
    id: "c2",
    title: "BLUE HOUR Encore",
    artist: "SEASON9",
    venue: "잠실실내체육관",
    date: "2026.07.03",
    dday: "D-29",
    buddies: 84,
    tags: ["택시", "맛집"]
  },
  {
    id: "c3",
    title: "Signal Pop-Up Stage",
    artist: "NOVA+",
    venue: "고척스카이돔",
    date: "2026.07.20",
    dday: "D-46",
    buddies: 61,
    tags: ["첫콘", "20대"]
  }
];

export const rooms: Room[] = [
  {
    id: "r1",
    title: "굿즈 줄 같이 서고 공연 전 카페까지",
    host: "moon_armies",
    role: "host",
    status: "open",
    match: 96,
    people: "3/4",
    tags: ["굿즈", "사진", "20대"]
  },
  {
    id: "r2",
    title: "잠실역에서 만나서 같이 입장해요",
    host: "soobin_d",
    role: "member",
    status: "ready",
    match: 91,
    people: "4/4",
    tags: ["같이입장", "여성만"]
  },
  {
    id: "r3",
    title: "끝나고 택시 쉐어할 분",
    host: "starlight_o",
    role: "pending",
    status: "open",
    match: 82,
    people: "2/4",
    tags: ["택시", "느긋한"]
  }
];

export const myProfile = {
  nickname: "duck_moon",
  intro: "콘서트 전 굿즈, 카페, 사진 루트를 좋아해요.",
  age: "20대",
  gender: "여성",
  preferredTags: ["굿즈", "사진", "같이입장", "느긋한"]
};

export const timetableStops: TimetableStop[] = [
  { id: 1, title: "잠실역 5번 출구", category: "집합", time: "14:00", dwellMinutes: 15, routeMinutes: 12, routeMode: "도보" },
  { id: 2, title: "KSPO Dome 굿즈 라인", category: "굿즈", time: "14:27 - 15:57", dwellMinutes: 90, routeMinutes: 8, routeMode: "택시" },
  { id: 3, title: "잠실 카페 mood", category: "카페", time: "16:05 - 17:35", dwellMinutes: 90, routeMinutes: 18, routeMode: "도보" },
  { id: 4, title: "공연 시작 (KSPO Dome)", category: "공연", time: "19:00", dwellMinutes: 30, routeMinutes: 0, routeMode: "잠금" }
];

export const places = [
  { name: "잠실 카페 mood", category: "카페", address: "서울 송파구 올림픽로 240", distance: "KSPO Dome에서 0.8km" },
  { name: "KSPO Dome 굿즈샵 (공식)", category: "굿즈", address: "서울 송파구 올림픽로 424", distance: "공연장 내부" },
  { name: "테이크아웃 토스트 잠실점", category: "식사", address: "서울 송파구 송파대로 567", distance: "잠실역 5번 출구" }
];

export const memories = [
  { stop: "KSPO Dome 굿즈 라인", time: "14:27 - 15:57", media: ["IMG", "VIDEO", "IMG"], by: "moon_armies · soobin_d" },
  { stop: "잠실 카페 mood", time: "16:05 - 17:35", media: ["VIDEO", "IMG", "+"], by: "starlight_o" }
];

export function calculateTimetableLoad(stops: TimetableStop[], extraMinutes = 0) {
  const availableMinutes = 270;
  const scheduledMinutes = stops.reduce((sum, stop) => sum + stop.dwellMinutes + stop.routeMinutes, 0);
  const normalizedMinutes = Math.max(availableMinutes, scheduledMinutes + 7);
  const usedMinutes = normalizedMinutes + extraMinutes;
  const overMinutes = Math.max(0, usedMinutes - availableMinutes);

  return {
    availableMinutes,
    usedMinutes,
    overMinutes,
    isOverTime: overMinutes > 0
  };
}
