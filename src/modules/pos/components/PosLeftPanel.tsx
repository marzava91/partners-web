"use client";

import { PosHeader } from "./PosHeader";
import { PosProductGrid } from "./PosProductGrid";
import { usePosFilters } from "../hooks/usePosFilters";
import type { PosCategory, PosProduct } from "../types";

export function PosLeftPanel({
  products,
  categories,
}: {
  products: PosProduct[];
  categories: PosCategory[];
}) {
  const { query, setQuery, categoryId, setCategoryId, filtered } =
    usePosFilters(products);

  return (
    <div className="h-full min-h-0 flex flex-col gap-4">
      <div className="shrink-0">
        <PosHeader
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          activeCategoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <PosProductGrid products={filtered} />
      </div>
    </div>
  );
}
