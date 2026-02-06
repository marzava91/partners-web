export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[var(--miji-ink)]">Escritorio</h1>
        <p className="text-sm text-[var(--miji-muted)]">Resumen rápido de tu tienda</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <Kpi title="Ventas hoy" value="$1,234" />
        <Kpi title="Pedidos pendientes" value="6" />
        <Kpi title="Stock crítico" value="3 productos" />
        <Kpi title="Ticket promedio" value="$12.30" />
      </section>

      {/* Main area */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Panel title="Pedidos recientes">
            <div className="text-sm text-[var(--miji-muted)]">Tabla placeholder</div>
          </Panel>
          <Panel title="Actividad reciente">
            <div className="text-sm text-[var(--miji-muted)]">Eventos placeholder</div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Atajos">
            <div className="grid grid-cols-2 gap-3">
              <QuickAction label="Nuevo pedido" />
              <QuickAction label="Agregar producto" />
              <QuickAction label="Ajustar stock" />
              <QuickAction label="Ver reportes" />
            </div>
          </Panel>

          <Panel title="Estado de tienda">
            <div className="text-sm text-[var(--miji-muted)]">
              Tienda: Principal • Abierta
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl p-4 border bg-white shadow-sm">
      <div className="text-sm text-[var(--miji-muted)]">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-[var(--miji-ink)]">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 border bg-white shadow-sm">
      <div className="mb-3 text-sm font-semibold text-[var(--miji-ink)]">{title}</div>
      {children}
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <button className="h-11 rounded-xl bg-black/5 hover:bg-black/10 text-sm font-medium text-[var(--miji-ink)]">
      {label}
    </button>
  );
}
