export function ChatInput() {
  return (
    <div className="p-4 flex gap-2">
      <input
        placeholder="Escribe un mensaje…"
        className="flex-1 h-10 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button className="h-10 px-4 rounded-lg bg-primary text-white">
        Enviar
      </button>
    </div>
  );
}
