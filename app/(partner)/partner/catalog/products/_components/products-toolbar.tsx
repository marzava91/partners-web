"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Upload, Plus, Search } from "lucide-react";

export default function ProductsToolbar() {
  const [query, setQuery] = useState("");

  // Nota: por ahora no conectamos el search con la tabla.
  // Luego lo elevamos a un parent (o Zustand) y filtramos server/client según tu data source.

  return (
    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/partner/catalog/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--miji-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Agregar Producto
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => alert("TODO: Export XLSX")}
        >
          <Download className="h-4 w-4" />
          Exportar XLSX
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => alert("TODO: Import XLSX")}
        >
          <Upload className="h-4 w-4" />
          Importar XLSX
        </button>
      </div>

      <div className="relative w-full md:w-[420px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, SKU, marca..."
          className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--miji-primary)]"
        />
      </div>
    </div>
  );
}
