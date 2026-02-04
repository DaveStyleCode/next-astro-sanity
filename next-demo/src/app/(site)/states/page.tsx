import type { Metadata } from "next";
import Link from "next/link";
import { getStates } from "@/lib/sanity/fetch";
import { toSlug, toTitleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All States",
  description: "Browse communities by state",
};

export default async function StatesPage() {
  const states = await getStates();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Browse by State</h1>
        <p className="mt-2 text-secondary">Explore {states.length} states with available communities</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {states.map((state) => (
          <Link key={state._id} href={`/states/${toSlug(state.name)}`} className="group rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-primary-500/50 hover:bg-white/10">
            <h2 className="text-lg font-semibold group-hover:text-primary-400 transition-colors">{toTitleCase(state.name)}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
