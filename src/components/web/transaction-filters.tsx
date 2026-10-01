"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

const TYPES = ["SENT", "RECEIVED", "PAYBILL", "AIRTIME", "WITHDRAWAL"];

type Category = { id: string; name: string };

export function TransactionFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = {
    search: searchParams.get("search") ?? "",
    type: searchParams.get("type") ?? "",
    category: searchParams.get("category") ?? "",
  };

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const hasFilters = current.search || current.type || current.category;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder="Search counterparty…"
          defaultValue={current.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Type filter */}
      <select
        value={current.type}
        onChange={(e) => update("type", e.target.value)}
        className="h-9 px-3 rounded-lg bg-card border border-border/60 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
      >
        <option value="">All types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Category filter */}
      <select
        value={current.category}
        onChange={(e) => update("category", e.target.value)}
        className="h-9 px-3 rounded-lg bg-card border border-border/60 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
      >
        <option value="">All categories</option>
        <option value="uncategorized">Uncategorized</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => {
            startTransition(() => router.push(pathname));
          }}
          className="h-9 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Clear
        </button>
      )}

      {isPending && (
        <span className="text-xs text-muted-foreground">Loading…</span>
      )}
    </div>
  );
}
