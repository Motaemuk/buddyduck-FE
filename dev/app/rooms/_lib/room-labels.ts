import type { RoomStatus } from "@/lib/data";

export function modeLabel(mode: RoomStatus) {
  return {
    host: "호스트 뷰",
    member: "멤버 뷰",
    pending: "신청 대기",
    visitor: "방문자 뷰"
  }[mode];
}
