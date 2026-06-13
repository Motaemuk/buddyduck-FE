import { ScreenEntry } from "@/features/screen-entry";
import { firstParam, type SearchParams } from "@/lib/routes";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  return <ScreenEntry id={firstParam(query.modal) === "apply" ? "CB-07Dprime" : "CB-07D"} />;
}
