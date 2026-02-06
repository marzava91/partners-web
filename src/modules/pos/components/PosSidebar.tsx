import { LayoutGrid, ShoppingBag, Settings } from "lucide-react";

const items = [
  { icon: LayoutGrid, label: "Home" },
  { icon: ShoppingBag, label: "Products" },
  { icon: Settings, label: "Settings" },
];

export function PosSidebar() {
  return (
    <aside className="bg-white border-r flex flex-col items-center py-4 gap-6">
      {items.map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="flex flex-col items-center text-muted-foreground hover:text-primary"
        >
          <Icon className="h-5 w-5" />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </aside>
  );
}
