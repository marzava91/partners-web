type Category = { id: string; name: string };

export function PosHeader({
  query,
  onQueryChange,
  categories,
  activeCategoryId,
  onCategoryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  categories: Category[];
  activeCategoryId: string | "ALL";
  onCategoryChange: (id: string | "ALL") => void;
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por nombre / SKU / código…"
          className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={() => onQueryChange("")}
          className="h-11 px-4 rounded-lg border text-sm hover:bg-muted"
        >
          Limpiar
        </button>
      </div>

      {/* Categories row */}
      <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
        <CategoryChip
          active={activeCategoryId === "ALL"}
          label="Todos"
          onClick={() => onCategoryChange("ALL")}
        />

        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            active={activeCategoryId === c.id}
            label={c.name}
            onClick={() => onCategoryChange(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-9 px-4 rounded-full border text-sm",
        active ? "bg-primary text-white border-primary" : "hover:bg-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
