// C:\Users\Workstation\workspace\miji-projects\partners-web\app\(partner)\partner\catalog\products\_components\products-table.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Star, Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCatalogProducts } from "@/modules/catalog/products/hooks/useCatalogProducts";
import type { CatalogProductItem } from "@/modules/catalog/products/api/catalog-products";
import type { BackendSortBy } from "@/modules/catalog/products/api/catalog-products";

type ProductRow = {
  id: string;
  name: string;
  sku: string;

  barcode?: string | null;
  tags?: string[];
  stock?: number | null;
  createdAt?: string;
  updatedAt?: string;

  categoryName?: string | null;
  brandName?: string | null;
  price?: number | null;

  visible: boolean;
  featured: boolean;
  imageUrl?: string | null;
};

function toRow(p: CatalogProductItem): ProductRow {
  return {
    id: p.id,
    name: p.title,
    sku: p.sku ?? "—",
    barcode: p.barcode ?? null,
    brandName: p.brandName ?? null,

    // UI decision: muestra primaryCategoryName, y si no existe, usa el primero de categoryNames
    categoryName: p.primaryCategoryName ?? p.categoryNames?.[0] ?? "—",

    tags: p.tags ?? [],
    price: p.retailPrice ?? null,
    stock: p.stock ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,

    visible: p.visibility !== "HIDDEN" && p.visibility !== "INACTIVE",
    featured: p.isFeatured,
    imageUrl: p.thumbnailUrl,
  };
}

function formatPEN(value: number) {
  return `S/${value.toFixed(2).replace(/\.00$/, "")}`;
}

type ColumnKey =
  | "select"
  | "sku"
  | "product"
  | "barcode"
  | "category"
  | "brand"
  | "tags"
  | "price"
  | "stock"
  | "visibility"
  | "featured"
  | "createdAt"
  | "updatedAt";

const LS_COLUMNS = "partner.catalog.products.columns.v1";

/**
 * Orden EXACTO como pediste:
 * [✓] Select
 * [✓] SKU
 * [✓] Producto
 * [ ] Código de barras
 * [✓] Categoría
 * [✓] Marca
 * [ ] Etiquetas
 * [✓] Precio
 * [✓] Stock
 * [✓] Visibilidad
 * [✓] Destacado
 * [ ] Creación
 * [ ] Modificación
 */
const COLUMN_ORDER: ColumnKey[] = [
  "select",
  "sku",
  "product",
  "barcode",
  "category",
  "brand",
  "tags",
  "price",
  "stock",
  "visibility",
  "featured",
  "createdAt",
  "updatedAt",
];

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  select: true,
  sku: true,
  product: true,
  barcode: false,
  category: true,
  brand: true,
  tags: false,
  price: true,
  stock: true,
  visibility: true,
  featured: true,
  createdAt: false,
  updatedAt: false,
};


const SORT_MAP: Partial<Record<ColumnKey, BackendSortBy>> = {
  product: "title",
  sku: "sku",
  barcode: "barcode",
  visibility: "visibility",
  featured: "isFeatured",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const DEFAULT_BACKEND_SORT: { sortBy: BackendSortBy; sortDir: "asc" | "desc" } = {
  sortBy: "title",
  sortDir: "asc",
};

// inverso: backendSortBy -> ColumnKey (para setear la columna activa al inicio)
const BACKEND_TO_COLUMN: Partial<Record<BackendSortBy, ColumnKey>> = {
  title: "product",
  sku: "sku",
  barcode: "barcode",
  visibility: "visibility",
  isFeatured: "featured",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};


function SortableTh({
  label,
  col,
  activeSortBy,
  activeSortDir,
  onClick,
  className = "px-4 py-3 text-left",
}: {
  label: string;
  col: ColumnKey;
  activeSortBy: ColumnKey | null;
  activeSortDir: "asc" | "desc" | null;
  onClick: (c: ColumnKey) => void;
  className?: string;
}) {
  const isActive = activeSortBy === col;
  const indicator = !isActive ? "" : activeSortDir === "asc" ? "↑" : "↓";
  const isSortable = !!SORT_MAP[col];

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => isSortable && onClick(col)}
        disabled={!isSortable}
        className={[
          "inline-flex items-center gap-2",
          isSortable ? "hover:text-gray-700" : "cursor-default opacity-50",
        ].join(" ")}
        title={isSortable ? "Ordenar" : "No ordenable"}
      >
        <span>{label}</span>
        <span className="text-xs text-gray-400">{indicator}</span>
      </button>
    </th>
  );
}

function EscToClose({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return null;
}

export default function ProductsTable() {
  const tenantId = "cmjz49qmt0000tz7sdgnmunac";

  // ===== Image preview dialog =====
  const [preview, setPreview] = useState<{ src: string; alt: string; loading: boolean } | null>(null);

  function openPreview(src?: string | null, alt?: string) {
    if (!src) return;
    setPreview({ src, alt: alt ?? "Imagen del producto", loading: true });
  }

  function closePreview() {
    setPreview(null);
  }

  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const [pageInput, setPageInput] = useState(String(page));

  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>(DEFAULT_VISIBLE);

  type SortDir = "asc" | "desc";
  type SortState = { sortBy: ColumnKey | null; sortDir: SortDir | null };

  const [sort, setSort] = useState<SortState>(() => ({
    sortBy: BACKEND_TO_COLUMN[DEFAULT_BACKEND_SORT.sortBy] ?? null,
    sortDir: DEFAULT_BACKEND_SORT.sortDir,
  }));

  const [showColumns, setShowColumns] = useState(false);
  const columnsRef = useRef<HTMLDivElement | null>(null);

  function cycleSort(col: ColumnKey) {
    if (!SORT_MAP[col]) return;

    setPage(1);
    setPageInput("1");

     setSort((prev) => {
    // si cambio de columna, empieza asc
    if (prev.sortBy !== col) return { sortBy: col, sortDir: "asc" };

    // si es la misma columna, alterna asc/desc
    return { sortBy: col, sortDir: prev.sortDir === "asc" ? "desc" : "asc" };
  });
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_COLUMNS);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      // Merge: evita que una versión vieja rompa si agregas columnas
      setColumnVisibility((prev) => {
        const next: Record<ColumnKey, boolean> = { ...DEFAULT_VISIBLE };
        for (const k of COLUMN_ORDER) {
          if (typeof parsed[k] === "boolean") next[k] = parsed[k] as boolean;
        }
        return next;
      });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_COLUMNS, JSON.stringify(columnVisibility));
    } catch {}
  }, [columnVisibility]);

  // Mantener input sincronizado cuando page cambie desde botones u otros efectos
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  // ✅ cuando cambia búsqueda o limit, volvemos a página 1
  useEffect(() => {
    setPage(1);
    setPageInput("1");
    setSelected({});
  }, [debouncedQ, limit]);

  useEffect(() => {
    if (!showColumns) return;

    function handleClickOutside(e: MouseEvent) {
      if (!columnsRef.current) return;
      if (!columnsRef.current.contains(e.target as Node)) {
        setShowColumns(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumns]);

  function clampPage(n: number) {
    if (!totalPages || totalPages < 1) return 1;
    return Math.min(Math.max(n, 1), totalPages);
  }

  function commitPageInput() {
    const raw = pageInput.trim();
    if (!raw) {
      setPageInput(String(page));
      return;
    }

    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setPageInput(String(page));
      return;
    }

    const next = clampPage(Math.floor(n));
    setPage(next);
  }

  const backendSortBy = sort.sortBy ? SORT_MAP[sort.sortBy] : undefined;

  const query = useCatalogProducts({
    tenantId,
    q: debouncedQ,
    limit,
    page,
    sortBy: backendSortBy,
    sortDir: backendSortBy ? (sort.sortDir ?? undefined) : undefined,
  });


  const items = query.data?.data.items ?? [];
  const total = query.data?.data.total ?? 0;
  const totalPages = query.data?.data.totalPages ?? 0;

  const rows = useMemo(() => items.map(toRow), [items]);

  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const topInnerRef = useRef<HTMLDivElement | null>(null);

  const visibleColsCount =
    (columnVisibility.select ? 1 : 0) +
    (columnVisibility.sku ? 1 : 0) +
    1 + // product siempre
    (columnVisibility.barcode ? 1 : 0) +
    (columnVisibility.category ? 1 : 0) +
    (columnVisibility.brand ? 1 : 0) +
    (columnVisibility.tags ? 1 : 0) +
    (columnVisibility.price ? 1 : 0) +
    (columnVisibility.stock ? 1 : 0) +
    (columnVisibility.visibility ? 1 : 0) +
    (columnVisibility.featured ? 1 : 0) +
    (columnVisibility.createdAt ? 1 : 0) +
    (columnVisibility.updatedAt ? 1 : 0);


  useEffect(() => {
    const tableEl = tableScrollRef.current;
    const topInner = topInnerRef.current;
    if (!tableEl || !topInner) return;

    const syncWidth = () => {
      topInner.style.width = `${tableEl.scrollWidth}px`;
    };

    syncWidth();
    const ro = new ResizeObserver(syncWidth);
    ro.observe(tableEl);

    return () => ro.disconnect();
  }, [rows.length, query.isLoading, columnVisibility]);

  useEffect(() => {
    const top = topScrollRef.current;
    const table = tableScrollRef.current;
    if (!top || !table) return;

    let lock = false;

    const onTop = () => {
      if (lock) return;
      lock = true;
      table.scrollLeft = top.scrollLeft;
      lock = false;
    };

    const onTable = () => {
      if (lock) return;
      lock = true;
      top.scrollLeft = table.scrollLeft;
      lock = false;
    };

    top.addEventListener("scroll", onTop, { passive: true });
    table.addEventListener("scroll", onTable, { passive: true });

    return () => {
      top.removeEventListener("scroll", onTop);
      table.removeEventListener("scroll", onTable);
    };
  }, []);

  // ===== Selection (solo sobre la página actual) =====
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allSelected = useMemo(() => {
    const ids = rows.map((r) => r.id);
    return ids.length > 0 && ids.every((id) => selected[id]);
  }, [rows, selected]);

  const someSelected = useMemo(() => {
    const ids = rows.map((r) => r.id);
    return ids.some((id) => selected[id]) && !allSelected;
  }, [rows, selected, allSelected]);

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    rows.forEach((r) => (next[r.id] = true));
    setSelected(next);
  }

  function toggleSelectOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleVisible(id: string) {
    alert(`TODO: PATCH visibility for product ${id}`);
  }

  function toggleFeatured(id: string) {
    alert(`TODO: PATCH featured for product ${id}`);
  }

  function removeRow(id: string) {
    const ok = confirm("¿Eliminar este producto?");
    if (!ok) return;
    alert(`TODO: DELETE product ${id}`);
  }

  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <div className="w-full">
      {/* ===== Header: una fila (premium) ===== */}
      <div
            className={[
          // 2 filas por defecto (tablet / widths reales con sidebar)
          "flex flex-col gap-2 border-b p-4",

          // 1 fila recién cuando realmente hay espacio (ajusta este número)
          "min-[1440px]:flex-row min-[1440px]:items-center",
        ].join(" ")}
      >
        {/* LEFT: Search + Actions */}
        <div className="flex w-full min-w-0 items-center gap-2 flex-nowrap">
          {/* Search (flexible) */}
          <div className="relative flex-1 basis-[480px] min-w-0 max-w-[340px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, SKU, ID, marca..."
              className="h-9 w-full min-w-0 rounded-md border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--miji-primary)]"
            />
          </div>

          {/* Columnas */}
          <div ref={columnsRef} className="relative">
            <button
              type="button"
              onClick={() => setShowColumns((s) => !s)}
              className="
                inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3
                border bg-white text-[var(--miji-ink)] shadow-sm transition
                hover:bg-gray-50 hover:shadow-md
              "
              title="Columnas"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-semibold">Columnas</span>
            </button>

            {showColumns && (
              <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-xl border bg-white p-2 shadow-lg">
                <div className="px-2 pb-2 text-xs font-semibold text-[var(--miji-muted)]">
                  Mostrar columnas
                </div>

                <div className="max-h-[280px] overflow-auto">
                  {COLUMN_ORDER.filter((k) => k !== "select" && k !== "product").map((key) => (
                    <label key={key} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!!columnVisibility[key]}
                        onChange={() =>
                          setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                      />
                      <span className="text-sm text-[var(--miji-ink)]">
                        {key === "sku" ? "SKU" :
                        key === "barcode" ? "Código de barras" :
                        key === "category" ? "Categoría" :
                        key === "brand" ? "Marca" :
                        key === "tags" ? "Etiquetas" :
                        key === "price" ? "Precio" :
                        key === "stock" ? "Stock" :
                        key === "visibility" ? "Visibilidad" :
                        key === "featured" ? "Destacado" :
                        key === "createdAt" ? "Creación" :
                        key === "updatedAt" ? "Modificación" :
                        key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions (gap uniforme) */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Crear producto */}
            <Link
              href="/partner/catalog/products/new"
              className="
                inline-flex h-10 shrink-0 items-center justify-center
                gap-2 rounded-xl px-4 text-sm font-semibold
                whitespace-nowrap
                border bg-white text-[var(--miji-ink)]
                shadow-sm transition
                hover:bg-gray-50 hover:shadow-md
              "
            >
              <Plus className="h-4 w-4 text-[var(--miji-orange)]" />
              Crear producto
            </Link>

            {/* Borrar (icon-only, rojo como tabla) */}
             <button
                type="button"
                disabled={Object.keys(selected).length === 0}
                onClick={() => alert('TODO: borrar productos seleccionados')}
                className="
                  inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                  text-red-600 transition hover:bg-red-50
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30
                  disabled:opacity-40 disabled:hover:bg-transparent
                "
                title="Borrar productos seleccionados"
              >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          
          
        </div>

        {/* RIGHT: Limit + Pagination */}
        <div
          className={[
            // En 2 filas: queda abajo y alineado al mismo lado del buscador (izquierda)
            "flex w-full min-w-0 items-center justify-start gap-2",

            // En 1 fila (>=1440): se va a la derecha sin romper
            "min-[1440px]:ml-auto min-[1440px]:w-auto min-[1440px]:justify-end min-[1440px]:flex-nowrap",
          ].join(" ")}
        >

          {/* loader premium al lado del total */}
          {query.isFetching && !query.isLoading && (
            <span className="inline-flex items-center gap-2 text-xs text-gray-400">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
              Actualizando
            </span>
          )}

          {/* Total como input (idéntico al estilo editable, pero bloqueado) */}
          <input
            value={String(total)}
            readOnly
            disabled
            className={[
              "shrink-0 h-9 w-[72px] rounded-md border bg-gray-50 px-2 text-center text-sm font-semibold",
              "text-[var(--miji-ink)]",
              "disabled:bg-gray-50 disabled:text-[var(--miji-ink)] disabled:opacity-100",
              "md:justify-self-start",
            ].join(" ")}
            aria-label={`Total de productos: ${total}`}
          />

          {/* Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="shrink-0 h-9 w-[84px] rounded-md border bg-white px-2 text-sm md:justify-self-start"
            aria-label="Items por página"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>

          {/* Pagination: <  [pageInput] / totalPages  > */}
          <div className="inline-flex shrink-0 items-center gap-2 md:col-span-1 md:justify-self-end">
            <button
              type="button"
              disabled={!canPrev || query.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white disabled:opacity-50"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-md border bg-white px-2 py-1">
              <input
                value={query.isLoading ? "" : pageInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setPageInput(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitPageInput();
                  if (e.key === "Escape") setPageInput(String(page));
                }}
                onBlur={commitPageInput}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={query.isLoading || query.isFetching || totalPages <= 1}
                className={[
                  "h-7 w-[44px] bg-transparent text-center text-sm font-semibold",
                  "text-[var(--miji-ink)] outline-none",
                  "disabled:text-gray-400 disabled:opacity-70",
                ].join(" ")}
                aria-label="Ir a la página"
              />

              <span className="text-sm text-gray-400">/</span>

              <span className="min-w-[34px] text-center text-sm font-semibold text-[var(--miji-ink)]">
                {query.isLoading ? "—" : totalPages}
              </span>
            </div>

            <button
              type="button"
              disabled={!canNext || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white disabled:opacity-50"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>


      {query.isError && (
        <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Error: {(query.error as Error)?.message ?? "Error cargando productos"}
        </div>
      )}

      {/* Top horizontal scrollbar (solo útil cuando hay overflow) */}
      <div ref={topScrollRef} className="w-full overflow-x-auto border-b bg-white">
        <div ref={topInnerRef} className="h-3" />
      </div>

      <div ref={tableScrollRef} className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
            <tr className="border-b">
              {columnVisibility.select && (
                <th className="w-[52px] px-4 py-3 text-left">
                  <input
                    aria-label="select all"
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}

              {/* SKU (sortable) */}
              {columnVisibility.sku && (
                <SortableTh
                  label="SKU"
                  col="sku"
                  activeSortBy={sort.sortBy}
                  activeSortDir={sort.sortDir}
                  onClick={cycleSort}
                />
              )}

              {/* Producto (sortable, siempre visible) */}
              <SortableTh
                label="Producto"
                col="product"
                activeSortBy={sort.sortBy}
                activeSortDir={sort.sortDir}
                onClick={cycleSort}
              />

              {/* Código (sortable) */}
              {columnVisibility.barcode && (
                <SortableTh
                  label="Código"
                  col="barcode"
                  activeSortBy={sort.sortBy}
                  activeSortDir={sort.sortDir}
                  onClick={cycleSort}
                />
              )}
              {/* Categoría (no sortable aún) */}
              {columnVisibility.category && <th className="px-4 py-3 text-left">Categoría</th>}

              {/* Marca (no sortable aún) */}
              {columnVisibility.brand && <th className="px-4 py-3 text-left">Marca</th>}

              {/* Etiquetas (no sortable aún) */}
              {columnVisibility.tags && <th className="px-4 py-3 text-left">Etiquetas</th>}

              {/* Precio (no sortable aún) */}
              {columnVisibility.price && <th className="px-4 py-3 text-left">Precio</th>}

              {/* Stock (no sortable aún) */}
              {columnVisibility.stock && <th className="px-4 py-3 text-left">Stock</th>}

              {/* Visibilidad (sortable) */}
              {columnVisibility.visibility && (
                <SortableTh
                  label="Visibilidad"
                  col="visibility"
                  activeSortBy={sort.sortBy}
                  activeSortDir={sort.sortDir}
                  onClick={cycleSort}
                />
              )}

              {/* Destacado (sortable) */}
              {columnVisibility.featured && (
                <SortableTh
                  label="Destacado"
                  col="featured"
                  activeSortBy={sort.sortBy}
                  activeSortDir={sort.sortDir}
                  onClick={cycleSort}
                />
              )}

              {/* Creación (sortable) */}
              {columnVisibility.createdAt && (
                <SortableTh
                  label="Creación"
                  col="createdAt"
                  activeSortBy={sort.sortBy}
                  activeSortDir={sort.sortDir}
                  onClick={cycleSort}
                />
              )}

              {/* Modificación (sortable) */}
              {columnVisibility.updatedAt && (
                <SortableTh
                  label="Modificación"
                  col="updatedAt"
                  activeSortBy={sort.sortBy}
                  activeSortDir={sort.sortDir}
                  onClick={cycleSort}
                />
            )}
            </tr>
          </thead>

          <tbody>
            {query.isLoading && (
              <tr>
                <td colSpan={visibleColsCount} className="px-4 py-10 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!query.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={visibleColsCount} className="px-4 py-10 text-center text-gray-500">
                  No hay productos para mostrar.
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                {columnVisibility.select && (
                  <td className="px-4 py-3">
                    <input
                      aria-label={`select ${r.name}`}
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={() => toggleSelectOne(r.id)}
                    />
                  </td>
                )}

                {columnVisibility.sku && <td className="px-4 py-3 text-gray-700">{r.sku}</td>}

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-white">
                      {r.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => openPreview(r.imageUrl, r.name)}
                          className="relative h-full w-full"
                          aria-label={`Ver imagen de ${r.name}`}
                          title="Ver imagen"
                        >
                          <Image
                            src={r.imageUrl}
                            alt={r.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </button>
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <Link
                        href={`/partner/catalog/products/${r.id}`}
                        className="font-medium text-[var(--miji-ink)] hover:underline"
                      >
                        {r.name}
                      </Link>
                      <span className="text-xs text-[var(--miji-muted)]">ID: {r.id}</span>
                    </div>
                  </div>
                </td>

                {columnVisibility.barcode && (
                  <td className="px-4 py-3 text-gray-700">
                    {r.barcode ?? "—"}
                  </td>
                )}
                
                {columnVisibility.category && <td className="px-4 py-3 text-gray-700">{r.categoryName ?? "—"}</td>}
                {columnVisibility.brand && <td className="px-4 py-3 text-gray-700">{r.brandName ?? "—"}</td>}
                {columnVisibility.tags && (
                  <td className="px-4 py-3 text-gray-700">
                    {r.tags && r.tags.length > 0 ? r.tags.join(", ") : "—"}
                  </td>
                )}

                {columnVisibility.price && (
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {typeof r.price === "number" ? formatPEN(r.price) : "—"}
                  </td>
                )}

                {columnVisibility.stock && (
                  <td className="px-4 py-3 text-gray-700">
                    {typeof r.stock === "number" ? r.stock : "—"}
                  </td>
                )}
                
                {columnVisibility.visibility && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleVisible(r.id)}
                      className={[
                        "inline-flex h-7 w-12 items-center rounded-full p-1 transition",
                        r.visible ? "bg-green-500/80" : "bg-gray-300",
                      ].join(" ")}
                      aria-label="toggle visibility"
                    >
                      <span
                        className={[
                          "h-5 w-5 rounded-full bg-white shadow transition",
                          r.visible ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </td>
                )}

                {columnVisibility.featured && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(r.id)}
                      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
                      aria-label="toggle featured"
                    >
                      <Star
                        className={[
                          "h-5 w-5",
                          r.featured ? "fill-yellow-400 text-yellow-400" : "text-gray-400",
                        ].join(" ")}
                      />
                    </button>
                  </td>
                )}

                {columnVisibility.createdAt && <td className="px-4 py-3 text-gray-700">—</td>}
                {columnVisibility.updatedAt && <td className="px-4 py-3 text-gray-700">—</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {/* ===== Image preview dialog ===== */}
        {preview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa de imagen"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closePreview();
            }}
          >
            {/* Panel: se ajusta al contenido (w-fit), con límites */}
            <div className="relative inline-block max-w-[95vw] max-h-[90vh]">
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={closePreview}
                className="absolute -right-3 -top-3 rounded-full bg-white p-2 shadow hover:bg-gray-50"
                aria-label="Cerrar"
                title="Cerrar"
              >
                ✕
              </button>

              {/* Caja blanca que se adapta y no fuerza scroll */}
              <div className="rounded-xl bg-white shadow-xl p-3">
                {/* Loader (solo mientras loading=true) */}
                {preview.loading && (
                  <div className="flex h-[240px] w-[240px] items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                  </div>
                )}

                <img
                  src={preview.src}
                  alt={preview.alt}
                  onLoad={() => setPreview((p) => (p ? { ...p, loading: false } : p))}
                  onError={() => setPreview((p) => (p ? { ...p, loading: false } : p))}
                  className={[
                    "block max-w-[92vw] max-h-[82vh] w-auto h-auto object-contain rounded-lg",
                    preview.loading ? "hidden" : "",
                  ].join(" ")}
                />
              </div>
            </div>

            <EscToClose onClose={closePreview} />
          </div>
        )}
      </div>
    </div>
  );
}



// TODO: agregar ordenamiento por columnas faltantes en backend y frontend: CATEGORÍA, MARCA, ETIQUETAS, PRECIO, STOCK -> no se hizo porque aún no está configurado el backend para esos campos que son arrays.