"use client";

import { PosLayout } from "@/modules/pos/components/PosLayout";
import { PosCart } from "@/modules/pos/components/PosCart";
import { PosLeftPanel } from "@/modules/pos/components/PosLeftPanel";
import type { PosCategory, PosProduct } from "@/modules/pos/types";

const categories: PosCategory[] = [
  { id: "hot", name: "Hot" },
  { id: "burger", name: "Burger" },
  { id: "pizza", name: "Pizza" },
  { id: "snack", name: "Snack" },
  { id: "coffee", name: "Coffee" },
];

const products: PosProduct[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `p-${i + 1}`,
  name: `Product ${i + 1}`,
  price: 9.9,
  categoryId: categories[i % categories.length].id,
}));

export default function PosPage() {
  return (
    <div className="h-[calc(100vh-112px)] min-h-0 overflow-hidden">
      <PosLayout>
        <PosLeftPanel products={products} categories={categories} />
        <PosCart />
      </PosLayout>
    </div>
  );
}
