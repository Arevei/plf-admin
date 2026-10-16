"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Client-side search + pagination over an in-memory list.
 * `toSearchText` returns the text a row can be found by; matching is case-insensitive
 * and every space-separated word in the query must appear.
 */
export function usePagedSearch<T>(items: T[], toSearchText: (item: T) => string, pageSize = DEFAULT_PAGE_SIZE) {
  const [query, setQueryState] = useState("");
  const [requestedPage, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const words = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return items;
    return items.filter((item) => {
      const text = toSearchText(item).toLowerCase();
      return words.every((word) => text.includes(word));
    });
    // toSearchText is expected to be a stable, pure mapping for the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, deferredQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Clamp instead of resetting so edits/deletes keep the admin on (or near) the page they were on.
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const setQuery = (value: string) => {
    setQueryState(value);
    setPage(1);
  };

  return { query, setQuery, page, setPage, pageCount, pageSize, pageItems, filteredCount: filtered.length, totalCount: items.length };
}

type PagedState = ReturnType<typeof usePagedSearch<unknown>>;

export function ListToolbar({
  state,
  placeholder,
  label,
  children,
}: {
  state: Pick<PagedState, "query" | "setQuery" | "filteredCount" | "totalCount">;
  placeholder: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#dce5e9] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7b8c95]" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={state.query}
          onChange={(event) => state.setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-[#dce5e9] bg-[#f7fbfc] pl-10 pr-3 text-sm text-[#172d3f] outline-none transition placeholder:text-[#8a99a1] focus:border-[#0b4a7f] focus:bg-white focus:ring-2 focus:ring-[#0b4a7f]/15"
        />
      </label>
      {children}
      <p className="shrink-0 text-xs font-semibold text-[#5d6b73]" aria-live="polite">
        {state.query ? `${state.filteredCount} of ${state.totalCount}` : `${state.totalCount}`} {state.totalCount === 1 ? "record" : "records"}
      </p>
    </div>
  );
}

function pageWindow(page: number, pageCount: number): Array<number | "gap"> {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((value, index) => (index > 0 && value - sorted[index - 1] > 1 ? ["gap" as const, value] : [value]));
}

export function Pagination({ state }: { state: Pick<PagedState, "page" | "setPage" | "pageCount" | "pageSize" | "filteredCount"> }) {
  const { page, setPage, pageCount, pageSize, filteredCount } = state;
  if (filteredCount <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredCount);
  const go = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const button = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
      <p className="text-xs text-[#5d6b73]">
        Showing <span className="font-semibold text-[#172d3f]">{from}–{to}</span> of {filteredCount}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => go(page - 1)} disabled={page === 1} className={`${button} border-[#dce5e9] bg-white text-[#172d3f] hover:border-[#0b4a7f]`}>
          Prev
        </button>
        {pageWindow(page, pageCount).map((value, index) =>
          value === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-[#8a99a1]">…</span>
          ) : (
            <button
              key={value}
              type="button"
              onClick={() => go(value)}
              aria-current={value === page ? "page" : undefined}
              className={`${button} ${value === page ? "border-[#0b4a7f] bg-[#0b4a7f] text-white" : "border-[#dce5e9] bg-white text-[#172d3f] hover:border-[#0b4a7f]"}`}
            >
              {value}
            </button>
          ),
        )}
        <button type="button" onClick={() => go(page + 1)} disabled={page === pageCount} className={`${button} border-[#dce5e9] bg-white text-[#172d3f] hover:border-[#0b4a7f]`}>
          Next
        </button>
      </div>
    </nav>
  );
}

export function EmptySearchResult({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9d8df] bg-white p-8 text-center text-sm text-[#5d6b73]">
      No results for <span className="font-semibold text-[#172d3f]">“{query}”</span>.{" "}
      <button type="button" onClick={onClear} className="font-semibold text-[#0b4a7f] underline underline-offset-4">
        Clear search
      </button>
    </div>
  );
}
