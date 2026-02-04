import { useState, useEffect, useRef, useMemo } from "react";

interface SearchState {
  _id: string;
  name: string;
}

interface SearchArea {
  _id: string;
  name: string;
  title?: string;
  url?: string;
  state?: { name: string };
  breadcrumb?: string;
}

interface SearchCommunity {
  _id: string;
  name: string;
  state?: { name: string };
  address?: string;
  brand?: string;
  amenities?: string[];
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SearchHouse {
  _id: string;
  address: string;
  community?: {
    _id: string;
    name: string;
    state?: { name: string };
  };
  floorPlanName?: string;
  price?: number;
  status?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
}

interface Props {
  states: SearchState[];
  areas: SearchArea[];
  communities: SearchCommunity[];
  houses: SearchHouse[];
}

type ResultType = "state" | "area" | "community" | "house";

interface SearchResult {
  type: ResultType;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  meta?: string;
}

// Pre-indexed item for fast searching
interface IndexedItem {
  searchText: string;
  result: SearchResult;
}

const MAX_RESULTS = 50;

/**
 * SearchInput - Interactive search component for houses, communities, and states
 *
 * Islands Architecture Pattern:
 * - Uses client:visible directive (hydrates when scrolled into view)
 * - Perfect for search since users typically navigate to search page intentionally
 * - Reduces initial JS bundle for pages that include this component
 */
export function SearchInput({ states, areas, communities, houses }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ResultType | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-compute searchable index once when data changes
  const searchIndex = useMemo(() => {
    const index: IndexedItem[] = [];

    // Index states
    for (const state of states) {
      index.push({
        searchText: state.name.toLowerCase(),
        result: {
          type: "state",
          id: state._id,
          title: state.name,
          subtitle: "State",
          href: `/states/${encodeURIComponent(state.name.toLowerCase())}`,
        },
      });
    }

    // Index areas
    for (const area of areas) {
      const searchText = [
        area.name,
        area.title,
        area.state?.name,
        area.breadcrumb,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      index.push({
        searchText,
        result: {
          type: "area",
          id: area._id,
          title: area.name,
          subtitle: area.state?.name ? `Area in ${area.state.name}` : "Area",
          href: area.url || `/areas/${area._id}`,
        },
      });
    }

    // Index communities
    for (const community of communities) {
      const searchText = [
        community.name,
        community.address,
        community.brand,
        community.state?.name,
        community.propertyType,
        ...(community.amenities || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const priceRange =
        community.minPrice && community.maxPrice
          ? `$${community.minPrice.toLocaleString()} - $${community.maxPrice.toLocaleString()}`
          : community.minPrice
            ? `From $${community.minPrice.toLocaleString()}`
            : undefined;

      index.push({
        searchText,
        result: {
          type: "community",
          id: community._id,
          title: community.name,
          subtitle: community.state?.name
            ? `Community in ${community.state.name}`
            : "Community",
          href: `/communities/${community._id}`,
          meta: priceRange,
        },
      });
    }

    // Index houses
    for (const house of houses) {
      const searchText = [
        house.address,
        house.community?.name,
        house.community?.state?.name,
        house.floorPlanName,
        house.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const details = [
        house.beds && `${house.beds} bed`,
        house.baths && `${house.baths} bath`,
        house.sqft && `${house.sqft.toLocaleString()} sqft`,
      ]
        .filter(Boolean)
        .join(" · ");

      index.push({
        searchText,
        result: {
          type: "house",
          id: house._id,
          title: house.address,
          subtitle: house.community?.name
            ? `House in ${house.community.name}${house.community.state?.name ? `, ${house.community.state.name}` : ""}`
            : "House",
          href: `/houses/${house._id}`,
          meta:
            house.price && house.status !== "Sold"
              ? `$${house.price.toLocaleString()}${details ? ` · ${details}` : ""}`
              : details || undefined,
        },
      });
    }

    return index;
  }, [states, areas, communities, houses]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce the query - wait 200ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setHasSearched(trimmed.length > 0);
      return;
    }

    setHasSearched(true);
    const lowerQuery = trimmed.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Simple linear search with early exit
    for (const item of searchIndex) {
      if (item.searchText.includes(lowerQuery)) {
        searchResults.push(item.result);
        if (searchResults.length >= MAX_RESULTS) break;
      }
    }

    setResults(searchResults);
  }, [debouncedQuery, searchIndex]);

  // Filter results based on active filter
  const filteredResults =
    activeFilter === "all"
      ? results
      : results.filter((r) => r.type === activeFilter);

  // Count results by type
  const stateCounts = results.filter((r) => r.type === "state").length;
  const areaCounts = results.filter((r) => r.type === "area").length;
  const communityCounts = results.filter((r) => r.type === "community").length;
  const houseCounts = results.filter((r) => r.type === "house").length;

  const getTypeIcon = (type: ResultType) => {
    switch (type) {
      case "state":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "area":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        );
      case "community":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "house":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
    }
  };

  const getTypeBadgeColor = (type: ResultType) => {
    switch (type) {
      case "state":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "area":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      case "community":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "house":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    }
  };

  return (
    <>
      <div className="mt-8">
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search houses, communities, or states..."
            className="bg-bg focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg px-4 py-3 pl-12 placeholder-gray-500 focus:ring-2 focus:outline-none"
          />
          <svg
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter tabs - only show when there are results */}
        {hasSearched && results.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-bg text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All ({results.length})
            </button>
            {stateCounts > 0 && (
              <button
                onClick={() => setActiveFilter("state")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === "state"
                    ? "bg-blue-500 text-white"
                    : "bg-bg text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                States ({stateCounts})
              </button>
            )}
            {areaCounts > 0 && (
              <button
                onClick={() => setActiveFilter("area")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === "area"
                    ? "bg-cyan-500 text-white"
                    : "bg-bg text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Areas ({areaCounts})
              </button>
            )}
            {communityCounts > 0 && (
              <button
                onClick={() => setActiveFilter("community")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === "community"
                    ? "bg-green-500 text-white"
                    : "bg-bg text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Communities ({communityCounts})
              </button>
            )}
            {houseCounts > 0 && (
              <button
                onClick={() => setActiveFilter("house")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === "house"
                    ? "bg-purple-500 text-white"
                    : "bg-bg text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Houses ({houseCounts})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {!hasSearched && (
          <p className="text-secondary">
            Search for houses, communities, or states by name, location, or
            features...
          </p>
        )}

        {hasSearched && query.trim().length < 2 && (
          <p className="text-secondary">
            Type at least 2 characters to search...
          </p>
        )}

        {hasSearched && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-secondary">
            No results found matching your search.
          </p>
        )}

        {filteredResults.map((result) => (
          <a
            key={`${result.type}-${result.id}`}
            href={result.href}
            className="bg-bg flex items-start gap-4 rounded-lg p-4 transition-shadow hover:shadow-md"
          >
            <div
              className={`mt-0.5 shrink-0 rounded-lg p-2 ${getTypeBadgeColor(result.type)}`}
            >
              {getTypeIcon(result.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-semibold">
                  {result.title}
                </h2>
              </div>
              <p className="text-secondary mt-0.5 text-sm">{result.subtitle}</p>
              {result.meta && (
                <p className="text-primary-600 dark:text-primary-400 mt-1 text-sm font-medium">
                  {result.meta}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
