import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Concert, Room } from "./data";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Request failed: ${path}`);
  return response.json() as Promise<T>;
}

export function useConcerts() {
  return useQuery({ queryKey: ["concerts"], queryFn: () => getJson<Concert[]>("/api/concerts") });
}

export function useRooms() {
  return useQuery({ queryKey: ["rooms"], queryFn: () => getJson<Room[]>("/api/rooms") });
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: Pick<Room, "title" | "tags">) => ({ id: `draft-${Date.now()}`, ...room }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] })
  });
}
