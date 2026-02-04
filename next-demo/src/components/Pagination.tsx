"use client";

import { useState } from "react";

interface PaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  gridClassName?: string;
}

export function Pagination<T>({
  items,
  itemsPerPage = 9,
  renderItem,
  emptyMessage = "No items found.",
  gridClassName = "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
}: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (items.length === 0) {
    return <p className="text-secondary">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className={gridClassName}>
        {currentItems.map((item, index) => renderItem(item, startIndex + index))}
      </div>
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="text-secondary px-2">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary-500 text-white"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      )}
      {totalPages > 1 && (
        <p className="text-secondary mt-4 text-center text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} communities
        </p>
      )}
    </div>
  );
}
