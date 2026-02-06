import ProductsTable from "./_components/products-table";

export default function Page() {
  return (
    <div className="space-y-3">
      {/* Header minimal */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--miji-ink)]">
          Productos
        </h1>
      </header>

      {/* Card */}
      <section className="rounded-xl border bg-white">
        <ProductsTable />
      </section>
    </div>
  );
}