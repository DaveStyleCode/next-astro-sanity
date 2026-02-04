import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CommunityGrid } from "@/components/CommunityGrid";
import { getStateWithCommunities, getAllStateNames } from "@/lib/sanity/fetch";

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  const stateNames = await getAllStateNames();
  return stateNames.map((name) => ({ state: name.toLowerCase().replace(/\s+/g, "-") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const stateName = stateSlug.replace(/-/g, " ");
  return { title: `Communities in ${stateName}`, description: `Browse communities in ${stateName}` };
}

export default async function StatePage({ params }: Props) {
  const { state: stateSlug } = await params;
  const stateName = stateSlug.replace(/-/g, " ");
  const { state: stateData, communities } = await getStateWithCommunities(stateName);

  if (!stateData) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-secondary">
          <Link href="/states" className="hover:text-primary-400 transition-colors">States</Link>
          <span className="mx-2">/</span>
          <span>{stateData.name}</span>
        </nav>
        <h1 className="text-3xl font-bold md:text-4xl capitalize">Communities in {stateData.name}</h1>
        <p className="mt-2 text-secondary">{communities.length} communities available</p>
      </header>
      <CommunityGrid communities={communities} itemsPerPage={9} />
    </div>
  );
}
