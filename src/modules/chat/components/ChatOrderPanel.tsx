import type { ChatOrderContext } from "../types";

export function ChatOrderPanel({ order }: { order: ChatOrderContext }) {
  return (
    <aside className="bg-white border rounded-xl h-full min-h-0 flex flex-col">
      <div className="p-4 border-b">
        <div className="font-semibold">Pedido {order.code}</div>
        <div className="text-xs text-muted-foreground">
          Estado: {order.status} · Pago: {order.paymentMethod}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <section>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Cliente
          </div>
          <div className="text-sm">{order.customerName}</div>
          <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
        </section>

        <section>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Dirección
          </div>
          <div className="text-sm">{order.address}</div>
          {order.reference ? (
            <div className="text-xs text-muted-foreground">{order.reference}</div>
          ) : null}
        </section>

        <section>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Items
          </div>
          <div className="space-y-2">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm truncate">{it.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.qty} × S/ {it.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  S/ {(it.qty * it.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-base font-semibold">S/ {order.total.toFixed(2)}</span>
        </div>

        <button className="w-full h-10 rounded-lg bg-primary text-white">
          Ver / editar pedido
        </button>
      </div>
    </aside>
  );
}
