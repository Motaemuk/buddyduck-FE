import type { Room } from "@/lib/data";

export function roomHref(room: Room) {
  if (room.status === "host") return "/rooms/host";
  if (room.status === "member") return "/rooms/member";
  if (room.status === "pending") return "/rooms/pending";
  return "/rooms/visitor";
}
