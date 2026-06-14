import { ScreenShell } from "../../_components/screen-shell";
import { firstParam, getScreenById, type SearchParams } from "../../_lib/routes";
import { RoomDetailScreen } from "../_components/room-detail-screen";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const showOpenChatModal = firstParam(query.modal) === "open-chat";
  return (
    <ScreenShell screen={getScreenById(showOpenChatModal ? "CB-08" : "CB-07B")}>
      <RoomDetailScreen mode="member" showOpenChatModal={showOpenChatModal} />
    </ScreenShell>
  );
}
