import type { ChatThread } from "../types";

export function ChatSidebar({ threads }: { threads: ChatThread[] }) {
  return (
    <aside className="bg-white border rounded-xl h-full min-h-0 flex flex-col">
      <div className="p-4 border-b font-semibold">Chats</div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {threads.map((t) => (
          <div
            key={t.id}
            className="px-4 py-3 border-b hover:bg-muted cursor-pointer"
          >
            <div className="font-medium text-sm">{t.title}</div>
            <div className="text-xs text-muted-foreground truncate">
              {t.lastMessage ?? "Sin mensajes"}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
