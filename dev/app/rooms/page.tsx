import { ScreenEntry } from "@/features/screen-entry";
import { firstParam, type SearchParams } from "@/lib/routes";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  return <ScreenEntry id={firstParam(query.modal) === "tags" ? "CB-04prime" : "CB-04"} />;
}
