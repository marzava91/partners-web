// C:\Users\Workstation\workspace\miji-projects\partners-web\src\modules\catalog\products\api\catalog-products.ts

export type CatalogProductItem = {
  id: string;
  title: string;
  sku: string | null;
  thumbnailUrl: string | null;
  visibility: string;
  isFeatured: boolean;

  barcode?: string | null;
  brandName?: string | null;

  categoryNames?: string[];          // <-- viene así
  primaryCategoryName?: string | null;

  tags?: string[];
  retailPrice?: number | null;       // <-- viene así
  stock?: number | null;

  createdAt?: string;
  updatedAt?: string;
};

export type CatalogProductsResponse = {
  data: {
    items: CatalogProductItem[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

export type ListCatalogProductsParams = {
  tenantId: string;
  q?: string;
  limit?: number;
  cursor?: string | null;
};

export const BACKEND_SORT_BY = [
  "createdAt",
  "updatedAt",
  "title",
  "sku",
  "barcode",
  "visibility",
  "isFeatured",
  "stockOnHand",
  "reorderPoint",
  "lotExpiresAt",
] as const;

export type BackendSortBy = (typeof BACKEND_SORT_BY)[number];
export type SortDir = "asc" | "desc";

export async function listCatalogProducts(args: {
  tenantId: string;
  q?: string;
  limit?: number;
  page?: number;
  sortBy?: BackendSortBy;     // ✅ tipado
  sortDir?: SortDir;
  signal?: AbortSignal;
}): Promise<CatalogProductsResponse> {
  const { tenantId, q = "", limit = 20, page = 1, sortBy, sortDir, signal } = args;

  const params = new URLSearchParams();
  params.set("tenantId", tenantId);

  if (q.trim()) params.set("q", q.trim());
  params.set("limit", String(limit));
  params.set("page", String(page));

  if (sortBy) {
    params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);
  }

  const res = await fetch(`/api/catalog/products?${params.toString()}`, { signal });

  if (!res.ok) throw new Error(`Error ${res.status} cargando productos`);
  return res.json();
}
