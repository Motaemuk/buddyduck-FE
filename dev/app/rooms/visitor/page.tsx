import { ScreenShell } from "../../_components/screen-shell";
import { firstParam, getScreenById, type SearchParams } from "../../_lib/routes";
import { RoomDetailScreen } from "../_components/room-detail-screen";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const showApplyModal = firstParam(query.modal) === "apply";
  return (
    <ScreenShell screen={getScreenById(showApplyModal ? "CB-07Dprime" : "CB-07D")}>
      <RoomDetailScreen mode="visitor" showApplyModal={showApplyModal} />
    </ScreenShell>
  );
}
