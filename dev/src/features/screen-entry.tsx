import { BuddyDuckApp } from "@/features/screens";
import { getScreenById, type ScreenId } from "@/lib/routes";

export function ScreenEntry({ id, showOpenChatModal = false }: { id: ScreenId; showOpenChatModal?: boolean }) {
  return <BuddyDuckApp screen={getScreenById(id)} showOpenChatModal={showOpenChatModal} />;
}
