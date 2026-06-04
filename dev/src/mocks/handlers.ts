import { http, HttpResponse } from "msw";
import { concerts, rooms } from "@/lib/data";

export const handlers = [
  http.get("/api/concerts", () => HttpResponse.json(concerts)),
  http.get("/api/rooms", () => HttpResponse.json(rooms))
];
