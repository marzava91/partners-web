import { PosProduct } from "../types";

export function PosProductGrid({ products }: { products: PosProduct[] }) {
  return (
    <div className="h-full min-h-0 bg-white border rounded-xl overflow-y-auto p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow cursor-pointer border"
          >
            <div className="h-24 bg-muted rounded-lg mb-3" />
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-muted-foreground">
              S/ {p.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
