"use client";

import { ChatLayout } from "@/modules/chat/components/ChatLayout";
import { ChatSidebar } from "@/modules/chat/components/ChatSidebar";
import { ChatConversation } from "@/modules/chat/components/ChatConversation";
import type { ChatThread, ChatMessage } from "@/modules/chat/types";
import { ChatOrderPanel } from "@/modules/chat/components/ChatOrderPanel";
import type { ChatOrderContext } from "@/modules/chat/types";

const threads: ChatThread[] = [
  {
    id: "1",
    title: "Pedido #1023 – Juan Pérez",
    lastMessage: "Gracias, ya me llegó",
    updatedAt: "",
    unreadCount: 0,
  },
];

const messages: ChatMessage[] = [
  {
    id: "m1",
    chatId: "1",
    sender: { id: "u1", name: "Juan", role: "customer" },
    text: "Hola, mi pedido aún no llega",
    createdAt: "",
  },
  {
    id: "m2",
    chatId: "1",
    sender: { id: "op1", name: "Operador", role: "operator" },
    text: "Hola Juan, ya lo estamos revisando",
    createdAt: "",
  },
];

const order: ChatOrderContext = {
  id: "o1",
  code: "#1023",
  status: "DISPATCHED",
  paymentMethod: "YAPE",
  customerName: "Juan Pérez",
  customerPhone: "+51 999 888 777",
  address: "Av. Larco 123, Trujillo",
  reference: "Portón negro, 2do piso",
  items: [
    { id: "i1", name: "Coca Cola 500ml", qty: 2, price: 3.5 },
    { id: "i2", name: "Panetón", qty: 1, price: 18.9 },
  ],
  total: 25.9,
};

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-112px)] min-h-0 overflow-hidden">
      <ChatLayout>
        <ChatSidebar threads={threads} />
        <ChatConversation messages={messages} />
        <ChatOrderPanel order={order} />
      </ChatLayout>
    </div>
  );
}
