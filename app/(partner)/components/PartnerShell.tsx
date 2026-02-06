"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import {
  // ===== Top-level icons (módulos) =====
  LayoutGrid, // Inicio
  Users,      // Terceros
  ShoppingBag,// Catálogo
  Package,    // Inventarios
  LineChart,  // Comercial
  Landmark,   // Finanzas
  Wallet,     // Cajas

  // ===== Item icons (submódulos) =====
  UserRound,
  Bike,
  Truck,
  Wrench,
  ClipboardList,
  Boxes,
  Barcode,
  Percent,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
  Map,

  // ===== UI icons =====
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronLeft,  
  ChevronRight,
  Bell,
  MessageSquare,
  ShoppingCart
} from "lucide-react";

/** =============================
 *  Helpers UI
 *  ============================= */
function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/** =============================
 *  LocalStorage keys
 *  ============================= */
const LS_COLLAPSED = "partner.sidebar.collapsed";
const LS_GROUPS = "partner.sidebar.openGroups";

/** =============================
 *  Nav types
 *  ============================= */
type NavItem = {
  href: string;
  label: string;
  icon: any;
  disabled?: boolean;
};

type NavGroup = {
  id: string;      // clave estable (persistencia de acordeón)
  title: string;   // título visible
  icon: any;       // ícono del “header” del grupo
  items: NavItem[];
};

/** =============================
 *  Accesos directos (Firebase-like)
 *  - Se muestran ARRIBA en modo colapsado
 *  - Recomendación: 3–6 items max
 *  ============================= */
const pinnedItems: NavItem[] = [
  { href: "/partner/dashboard", label: "Escritorio", icon: LayoutGrid },
  { href: "/partner/catalog/products", label: "Productos", icon: ShoppingBag },
  { href: "/partner/pos", label: "POS", icon: Store },
];

/** =============================
 *  NAV CONFIG (estructura)
 *  - Aquí agregas/quitas módulos y submódulos.
 *  ============================= */
const navGroups: NavGroup[] = [
  {
    id: "home",
    title: "Inicio",
    icon: LayoutGrid,
    items: [
      { href: "/partner/dashboard", label: "Escritorio", icon: LayoutGrid },
      { href: "/partner/staff", label: "Colaboradores", icon: Users },
    ],
  },
  {
    id: "third-parties",
    title: "Terceros",
    icon: Users,
    items: [
      { href: "/partner/third-parties/partners", label: "Comercios", icon: Users },
      { href: "/partner/third-parties/shoppers", label: "Clientes", icon: UserRound },
      { href: "/partner/third-parties/riders", label: "Repartidores", icon: Bike },
      { href: "/partner/third-parties/suppliers", label: "Proveedores", icon: Truck },
    ],
  },
  {
    id: "catalog",
    title: "Catálogo",
    icon: ShoppingBag,
    items: [
      { href: "/partner/catalog/products", label: "Productos", icon: ShoppingBag },
      { href: "/partner/catalog/services", label: "Servicios", icon: Wrench },
    ],
  },
  {
    id: "inventory",
    title: "Inventarios",
    icon: Package,
    items: [
      { href: "/partner/inventory/warehouses", label: "Almacenes", icon: Package },
      { href: "/partner/inventory/trace", label: "Trazabilidad", icon: ClipboardList },
      { href: "/partner/inventory/replenishment", label: "Reabastecimiento", icon: LineChart },
      { href: "/partner/inventory/receiving", label: "Recepción", icon: Boxes },
      { href: "/partner/inventory/adjustments", label: "Ajustes de Stock", icon: Barcode },
      { href: "/partner/inventory/cost-history", label: "Historial de Costos", icon: Receipt },
    ],
  },
  {
    id: "commercial",
    title: "Comercial",
    icon: LineChart,
    items: [
      { href: "/partner/commercial/customer-quotes", label: "Presupuestos Clientes", icon: ClipboardList },
      { href: "/partner/commercial/marketing-campaigns", label: "Campañas Comerciales", icon: Percent },
      { href: "/partner/commercial/customer-rfm", label: "Segmentación RFM", icon: Users },
      { href: "/partner/commercial/product-portfolio", label: "Portafolio Productos (BCG-3D)", icon: LineChart},
      { href: "/partner/commercial/sales-funnel", label: "Embudo Comercial", icon: LineChart, disabled: true },
      { href: "/partner/commercial/price-elasticity", label: "Elasticidad de Precios", icon: LineChart, disabled: true },
      { href: "/partner/commercial/product-cannibalization", label: "Canibalización", icon: LineChart, disabled: true },
      { href: "/partner/commercial/geo-heatmap", label: "Mapa de Calor", icon: Map, disabled: true },
    ],
  },
  {
    id: "finance",
    title: "Finanzas",
    icon: Landmark,
    items: [
      { href: "/partner/finance/billing-customers", label: "Facturas Clientes", icon: Receipt, disabled: true },
      { href: "/partner/finance/billing-suppliers", label: "Facturas Proveedores", icon: Receipt, disabled: true },
      { href: "/partner/finance/taxes", label: "Impuestos (IGV)", icon: Landmark, disabled: true },
      { href: "/partner/finance/opex", label: "Gastos Operativos", icon: CreditCard, disabled: true },
    ],
  },
  {
    id: "cash",
    title: "Cajas",
    icon: Wallet,
    items: [
      { href: "/partner/cash/status", label: "Estado de Cajas", icon: Wallet, disabled: true },
      { href: "/partner/cash/reconciliations", label: "Historial de Cuadres", icon: ClipboardList, disabled: true },
      { href: "/partner/cash/movements", label: "Movimientos & Agente Bancario", icon: CreditCard, disabled: true },
    ],
  },
];

/** =============================
 *  Path helpers
 *  ============================= */
function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function groupContainsPath(group: NavGroup, pathname: string) {
  return group.items.some((it) => isActivePath(pathname, it.href));
}

/** =============================
 *  Persisted accordion state
 *  ============================= */
function loadOpenGroups(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_GROUPS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch {
    return {};
  }
}

function saveOpenGroups(v: Record<string, boolean>) {
  try {
    localStorage.setItem(LS_GROUPS, JSON.stringify(v));
  } catch {}
}

/** =============================
 *  Component
 *  ============================= */
export default function PartnerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // ===== Sidebar collapsed state =====
  const [collapsed, setCollapsed] = useState(false);

  // ===== Accordion state per group =====
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  /** Load prefs on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_COLLAPSED);
      if (raw != null) setCollapsed(raw === "1");
    } catch {}
    setOpenGroups(loadOpenGroups());
  }, []);

  /** Persist collapsed */
  useEffect(() => {
    try {
      localStorage.setItem(LS_COLLAPSED, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  /** Auto-open group that contains current route (only when expanded) */
  useEffect(() => {
    if (collapsed) return;
    const current = navGroups.find((g) => groupContainsPath(g, pathname));
    if (!current) return;

    setOpenGroups((prev) => {
      if (prev[current.id]) return prev;
      const next = { ...prev, [current.id]: true };
      saveOpenGroups(next);
      return next;
    });
  }, [pathname, collapsed]);

  /** Breadcrumb label */
  const currentLabel = useMemo(() => {
    const allItems = navGroups.flatMap((g) => g.items);
    const match = allItems.find((x) => isActivePath(pathname, x.href));
    return match?.label ?? (pathname?.split("/").pop() || "Dashboard");
  }, [pathname]);

  /** Toggle group accordion */
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      saveOpenGroups(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--miji-admin-bg)]">
      <div
        className={cn(
          "grid grid-cols-1 lg:min-h-screen",
          collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[248px_1fr]"
        )}
      >
        {/* =========================
         *  SIDEBAR
         *  ========================= */}
        <aside className="hidden lg:flex lg:flex-col h-screen overflow-hidden border-r bg-white">
          {/* ============ Brand row (más pro) ============
              - Izquierda: logo + título
              - Derecha: toggle con divisor
           */}
          <div className={cn("h-16 flex items-center border-b", collapsed ? "px-3" : "px-4")}>
            <div className={cn("flex items-center gap-3", collapsed && "justify-center flex-1")}>
              <img
                src="/images/miji-logo.png"
                alt="MIJI"
                className={cn("w-auto", collapsed ? "h-8" : "h-9")}
              />
              {!collapsed && (
                <div className="leading-tight">
                  <div className="text-[20px] font-semibold text-[var(--miji-ink)]"> Control Center</div>
                </div>
              )}
            </div>
          </div>

                    {/* ============ Nav (scrollable) ============ 
              ✅ pt-3 para separar "Inicio" de la línea superior (lo que pediste)
           */}
          <nav className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] pt-3">
            {/* =========================
                COLLAPSED: shortcuts + categorías
                - No mostramos TODOS los subitems (evitamos “columna infinita”)
                - Firebase-like
               ========================= */}
            {collapsed ? (
              <div className="px-2 space-y-3">
                {/* ===== Accesos directos ===== */}
                <div className="space-y-1">
                  {pinnedItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={cn(
                          "flex items-center justify-center h-10 rounded-xl transition",
                          active
                            ? "bg-[color-mix(in_oklab,var(--miji-orange)_14%,white)] text-[var(--miji-ink)]"
                            : "text-[var(--miji-muted)] hover:bg-black/5 hover:text-[var(--miji-ink)]"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active && "text-[var(--miji-orange)]")} />
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-black/10" />

                {/* ===== Categorías top-level (solo íconos) ===== */}
                <div className="space-y-1">
                  {navGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const hasActive = groupContainsPath(group, pathname);

                    return (
                      <button
                        key={group.id}
                        type="button"
                        title={group.title}
                        onClick={() => {
                          // ✅ click en categoría estando colapsado:
                          // 1) expandir sidebar
                          setCollapsed(false);
                          // 2) abrir ese grupo
                          setOpenGroups((prev) => {
                            const next = { ...prev, [group.id]: true };
                            saveOpenGroups(next);
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full flex items-center justify-center h-10 rounded-xl transition",
                          hasActive
                            ? "bg-[color-mix(in_oklab,var(--miji-orange)_10%,white)] text-[var(--miji-ink)]"
                            : "text-[var(--miji-muted)] hover:bg-black/5 hover:text-[var(--miji-ink)]"
                        )}
                      >
                        <GroupIcon className={cn("h-4 w-4", hasActive && "text-[var(--miji-orange)]")} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* =========================
                 EXPANDED: acordeón completo
                 ✅ espacio entre grupos: space-y-1 (más minimal)
                 ========================= */
              <>
              {/* ===== Frecuentes(expanded) ===== */}
              <div className="px-3">
                <div className="px-2 pt-1 pb-2">
                  <div className="text-[12px] font-semibold tracking-wide text-[var(--miji-muted)]">
                    Frecuentes
                  </div>
                </div>

                <div className="space-y-1 pb-2">
                  {pinnedItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 pl-5 pr-2 py-2 rounded-xl text-[12px] transition",
                          active
                            ? "bg-[color-mix(in_oklab,var(--miji-orange)_14%,white)] text-[var(--miji-ink)]"
                            : "text-[var(--miji-muted)] hover:bg-black/5 hover:text-[var(--miji-ink)]"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active && "text-[var(--miji-orange)]")} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider sutil */}
                <div className="h-px bg-black/10 mx-2" />
              </div>

              <div className="mt-2 space-y-1">
                {navGroups.map((group) => {
                  const groupIsOpen = !!openGroups[group.id];
                  const groupHasActive = groupContainsPath(group, pathname);

                  return (
                    <div key={group.id} className="rounded-xl">
                      {/* ===== Group Header =====
                          ✅ py-2 para respirar un poco (y verse menos “apretado”)
                          ✅ font-semibold (más claro que medium)
                       */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className={cn(
                          "w-full flex items-center justify-between",
                          "pl-5 pr-2 py-2",
                          "hover:bg-black/5",
                          groupHasActive ? "text-[var(--miji-ink)]" : "text-[var(--miji-muted)]"
                        )}
                        aria-expanded={groupIsOpen}
                        aria-controls={`group-${group.id}`}
                      >
                        <span className="text-[12px] font-semibold tracking-wide">{group.title}</span>

                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            groupIsOpen ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </button>

                      {/* ===== Accordion content ===== */}
                      <div
                        id={`group-${group.id}`}
                        className={cn(
                          "overflow-hidden transition-[max-height] duration-200",
                          groupIsOpen ? "max-h-[720px]" : "max-h-0"
                        )}
                      >
                        <div className="px-3 pb-2">
                          {group.items.map((item) => {
                            const active = isActivePath(pathname, item.href);
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                aria-disabled={item.disabled}
                                className={cn(
                                  "flex items-center gap-3 pl-5 pr-2 py-2 rounded-xl text-[12px] transition",
                                  active
                                    ? "bg-[color-mix(in_oklab,var(--miji-orange)_14%,white)] text-[var(--miji-ink)]"
                                    : "text-[var(--miji-muted)] hover:bg-black/5 hover:text-[var(--miji-ink)]"
                                )}
                              >
                                <Icon className={cn("h-4 w-4", active && "text-[var(--miji-orange)]")} />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
            )}
          </nav>

          {/* ============ Bottom actions (fijo) ============
              - Collapse/Expand (tipo Firebase)
              - POS 
              - Settings
              - Logout
  
          */}

          {/* Collapse / Expand (Firebase-like, icon-only, left aligned) */}
          <div className="px-4 pb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setCollapsed((s) => !s)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
              className={cn(
                "h-7 w-7 rounded-md",
                "inline-flex items-center justify-center",
                "text-[var(--miji-muted)]/70 hover:text-[var(--miji-ink)]",
                "hover:bg-black/5 transition"
              )}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <div className="border-t p-2 space-y-1">
            {/* POS
            <Link
              href="/partner/pos"
              title={collapsed ? "Punto de venta" : undefined}
              className={cn(
                "w-full flex items-center rounded-xl transition hover:bg-black/5",
                collapsed ? "justify-center h-11" : "gap-3 px-3 py-2",
                "text-[12px]",
                isActivePath(pathname, "/partner/pos")
                  ? "bg-[color-mix(in_oklab,var(--miji-orange)_14%,white)] text-[var(--miji-ink)]"
                  : "text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
              )}
            >
              <CreditCard className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Punto de venta</span>}
            </Link>
            */}

            {/* Profile */}
            <Link
              href="/partner/profile"
              title={collapsed ? "Perfil" : undefined}
              className={cn(
                "w-full flex items-center rounded-xl transition hover:bg-black/5",
                collapsed ? "justify-center h-11" : "gap-3 px-3 py-2",
                "text-[12px]",
                isActivePath(pathname, "/partner/profile")
                  ? "bg-[color-mix(in_oklab,var(--miji-orange)_14%,white)] text-[var(--miji-ink)]"
                  : "text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
              )}
            >
              <UserRound className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Perfil</span>}
            </Link>            

            {/* Settings */}
            <Link
              href="/partner/settings"
              title={collapsed ? "Settings" : undefined}
              className={cn(
                "w-full flex items-center rounded-xl transition hover:bg-black/5",
                collapsed ? "justify-center h-11" : "gap-3 px-3 py-2",
                "text-[12px]",
                isActivePath(pathname, "/partner/settings")
                  ? "bg-[color-mix(in_oklab,var(--miji-orange)_14%,white)] text-[var(--miji-ink)]"
                  : "text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
              )}
            >
              <Settings className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Link>

            {/* Logout */}
            <button
              title={collapsed ? "Log out" : undefined}
              className={cn(
                "w-full flex items-center rounded-xl transition hover:bg-black/5",
                collapsed ? "justify-center h-11" : "gap-3 px-3 py-2",
                "text-[12px] text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
              )}
              onClick={() => (window.location.href = "/logout")}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Log out</span>}
            </button>


          </div>
        </aside>

        {/* =========================
         *  CONTENT
         *  ========================= */}
        <div className="flex h-screen min-h-0 flex-col overflow-hidden">
          {/* TOPBAR */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-white">
            {/* Left: breadcrumb + search */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Breadcrumb 
              <div className="text-sm text-[var(--miji-muted)] whitespace-nowrap">
                <span className="font-semibold text-[var(--miji-ink)]">Partner</span>
                <span className="mx-2">/</span>
                <span className="capitalize">{currentLabel}</span>
              </div>
              */}

              {/* Search (placeholder) */}
              <div className="hidden md:block w-[420px] max-w-[42vw]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar acciones, módulos, pedidos, productos..."
                    className={cn(
                      "w-full h-10 rounded-xl border bg-white",
                      "pl-10 pr-4 text-sm", // 👈 espacio para la lupa
                      "outline-none focus:ring-2 focus:ring-black/10"
                    )}
                  />

                  {/* Icono lupa */}
                  <Search
                    className="
                      absolute left-3 top-1/2 -translate-y-1/2
                      h-4 w-4
                      text-[var(--miji-muted)]
                      pointer-events-none
                    "
                  />
                </div>
              </div>
            </div>

            {/* Right: actions + operator */}
            <div className="flex items-center gap-4">
              {/* Divider + action icons */}
              <div className="flex items-center gap-2">
                
                {/* Chat */}
                <button
                  type="button"
                  title="Chat"
                  className="h-10 w-10 rounded-xl inline-flex items-center justify-center hover:bg-black/5 transition text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
                  onClick={() => {
                    router.push("/partner/chat");
                    console.log("chat");
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  title="Notificaciones"
                  className="h-10 w-10 rounded-xl inline-flex items-center justify-center hover:bg-black/5 transition text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
                  onClick={() => {
                    router.push("/partner/notifications");
                    console.log("notifications");
                  }}
                >
                  <Bell className="h-4 w-4" />
                </button>

                {/* POS */}
                <button
                  type="button"
                  title="Punto de venta"
                  className="h-10 w-10 rounded-xl inline-flex items-center justify-center hover:bg-black/5 transition text-[var(--miji-muted)] hover:text-[var(--miji-ink)]"
                  onClick={() => {
                    router.push("/partner/pos");;
                  }}
                >
                  <Store className="h-4 w-4" />
                </button>
                

                <div className="h-8 w-px bg-black/10" />
              </div>

              {/* Operator / Store / Avatar */}
              <div className="flex items-center gap-3">
                <div className="text-right leading-tight">
                  <div className="text-sm font-medium text-[var(--miji-ink)]">Operador</div>
                  <div className="text-xs text-[var(--miji-muted)]">Tienda: Principal</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-black/10" />
              </div>
            </div>
          </header>


          {/* MAIN */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="w-full min-h-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
