import { ScreenShell } from "../_components/screen-shell";
import { firstParam, getScreenById, type SearchParams } from "../_lib/routes";
import { TimetableEditScreen } from "./_components/timetable-edit-screen";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const showWarning = firstParam(query.modal) === "warning";
  return (
    <ScreenShell screen={getScreenById(showWarning ? "CB-11prime" : "CB-11")}>
      <TimetableEditScreen showWarning={showWarning} />
    </ScreenShell>
  );
}
