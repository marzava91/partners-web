import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import type { ChatMessage } from "../types";

export function ChatConversation({ messages }: { messages: ChatMessage[] }) {
  return (
    <section className="bg-white border rounded-xl h-full min-h-0 flex flex-col">
      <div className="p-4 border-b font-semibold">
        Conversación
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <ChatMessageList messages={messages} />
      </div>

      <div className="shrink-0 border-t">
        <ChatInput />
      </div>
    </section>
  );
}
