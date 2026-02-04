import type { Metadata } from "next";
import { SearchInput } from "@/components/SearchInput";
import { getStates, getAreas, getAllCommunities, getAllHouses } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Search",
  description: "Search houses, communities, areas, and states",
};

export default async function SearchPage() {
  const [states, areas, communities, houses] = await Promise.all([
    getStates(),
    getAreas(),
    getAllCommunities(),
    getAllHouses(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Search</h1>
      <p className="mt-2 text-secondary">
        Find houses, communities, areas, or states by name, location, or features
      </p>
      <SearchInput states={states} areas={areas} communities={communities} houses={houses} />
    </div>
  );
}
