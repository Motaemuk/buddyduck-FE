import { ScreenEntry } from "@/features/screen-entry";
import { firstParam, type SearchParams } from "@/lib/routes";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  return <ScreenEntry id={firstParam(query.modal) === "warning" ? "CB-11prime" : "CB-11"} />;
}
