import type { ChatMessage } from "../types";

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isOperator = message.sender.role !== "customer";

  return (
    <div
      className={`mb-3 flex ${
        isOperator ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
          isOperator
            ? "bg-primary text-white"
            : "bg-muted"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
