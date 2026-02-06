"use client";

import { useMemo, useState } from "react";
import { PosProduct } from "../types";

export function usePosFilters(products: PosProduct[]) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const byCat = categoryId === "ALL" ? true : p.categoryId === categoryId;
      const byQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return byCat && byQuery;
    });
  }, [products, query, categoryId]);

  return { query, setQuery, categoryId, setCategoryId, filtered };
}
