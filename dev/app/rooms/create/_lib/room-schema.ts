import { z } from "zod";

export const roomSchema = z.object({
  title: z.string().min(5, "방 제목을 조금 더 구체적으로 적어 주세요"),
  intro: z.string().min(10, "소개는 10자 이상 필요해요"),
  meetPlace: z.string().min(1, "집합 장소를 입력해 주세요"),
  meetTime: z.string().min(1, "집합 시간을 입력해 주세요"),
  openChatUrl: z.string().optional(),
  openChatPassword: z.string().optional()
});
