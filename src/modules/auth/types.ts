export type Session = {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  storeIds: string[];
  defaultStoreId?: string | null;
};

export type LoginResponse = {
  accessToken: string;        // JWT corto
  refreshToken?: string;      // si tu Core API lo soporta
  session: Session;
};
