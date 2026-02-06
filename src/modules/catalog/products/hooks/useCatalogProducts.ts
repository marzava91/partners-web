// C:\Users\Workstation\workspace\miji-projects\partners-web\src\modules\catalog\products\hooks\useCatalogProducts.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listCatalogProducts, type CatalogProductsResponse } from "../api/catalog-products";
import type { BackendSortBy, SortDir } from "../api/catalog-products";

export function useCatalogProducts(args: {
  tenantId: string;
  q: string;
  limit: number;
  page: number;
  sortBy?: BackendSortBy;
  sortDir?: SortDir;
}) {
  const { tenantId, q, limit, page, sortBy, sortDir } = args;

  return useQuery<CatalogProductsResponse>({
    queryKey: ["catalog-products", tenantId, q, limit, page, sortBy ?? null, sortDir ?? null],
    enabled: !!tenantId,
    queryFn: ({ signal }) =>
      listCatalogProducts({ tenantId, q, limit, page, sortBy, sortDir, signal }),
    placeholderData: keepPreviousData,
  });
}