import { ScreenEntry } from "@/features/screen-entry";
import { firstParam, type SearchParams } from "@/lib/routes";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  return <ScreenEntry id="CB-07A" showOpenChatModal={firstParam(query.modal) === "open-chat"} />;
}
