import { ChatMessageItem } from "./ChatMessageItem";
import type { ChatMessage } from "../types";

export function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((m) => (
        <ChatMessageItem key={m.id} message={m} />
      ))}
    </>
  );
}
