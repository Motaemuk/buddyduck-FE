import { ScreenShell } from "../_components/screen-shell";
import { firstParam, getScreenById, type SearchParams } from "../_lib/routes";
import { RoomListScreen } from "./_components/room-list-screen";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const showTagModal = firstParam(query.modal) === "tags";
  return (
    <ScreenShell screen={getScreenById(showTagModal ? "CB-04prime" : "CB-04")}>
      <RoomListScreen showTagModal={showTagModal} />
    </ScreenShell>
  );
}
