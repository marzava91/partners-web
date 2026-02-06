import { z } from "zod";

export const loginSchema = z.discriminatedUnion("identifierType", [
  z.object({
    identifierType: z.literal("email"),
    email: z.string().min(1, "Email requerido"),
    phone: z.string().optional(),
    password: z.string().min(1, "Password requerido"),
  }),
  z.object({
    identifierType: z.literal("phone"),
    phone: z.string().min(7, "Teléfono requerido"),
    email: z.string().optional(),
    password: z.string().min(1, "Password requerido"),
  }),
]);

export type LoginFormValues = z.infer<typeof loginSchema>;
