import { resolveScreenFromSlug, type SearchParams } from "@/lib/routes";
import { BuddyDuckApp } from "@/features/screens";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<SearchParams>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const screen = resolveScreenFromSlug(slug ?? [], query);

  return <BuddyDuckApp screen={screen} />;
}
