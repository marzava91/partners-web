export type PosCategory = {
  id: string;
  name: string;
};

export type PosProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
};

export type PosCartItem = {
  product: PosProduct;
  quantity: number;
};
