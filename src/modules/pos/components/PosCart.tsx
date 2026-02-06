export function PosCart() {
  return (
    <aside className="bg-white border rounded-xl h-full flex flex-col min-h-0">
      <div className="p-4 border-b shrink-0">
        <h2 className="font-semibold">Order</h2>
        <p className="text-xs text-muted-foreground">No items yet</p>
      </div>

      {/* Items scrollean */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 text-sm text-muted-foreground">
        No items yet
      </div>

      {/* Botón fijo abajo */}
      <div className="p-4 border-t shrink-0 bg-white">
        <button className="w-full h-12 rounded-xl bg-primary text-white font-semibold">
          Charge S/ 0.00
        </button>
      </div>
    </aside>
  );
}
