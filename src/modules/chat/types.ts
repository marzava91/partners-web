export type ChatUser = {
  id: string;
  name: string;
  role: "customer" | "operator" | "support";
};

export type ChatMessage = {
  id: string;
  chatId: string;
  sender: ChatUser;
  text: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount: number;
};

export type ChatOrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type ChatOrderContext = {
  id: string;
  code: string; // #1023
  status: "PLACED" | "PREPARING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  paymentMethod: "CASH" | "CARD" | "YAPE" | "TRANSFER" | "MIXED";
  customerName: string;
  customerPhone: string;
  address: string;
  reference?: string;
  items: ChatOrderItem[];
  total: number;
};
