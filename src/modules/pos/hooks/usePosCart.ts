import type { PosCartItem } from "../types";

export function usePosCart() {
  const items: PosCartItem[] = [];
  const total = 0;

  return { items, total };
}
