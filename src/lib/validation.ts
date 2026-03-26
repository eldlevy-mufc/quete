import { z } from "zod";

/* ─── Shared ─── */
const safeString = (max = 500) =>
  z.string().max(max).transform((s) => s.replace(/<[^>]*>/g, "").trim());

const safeId = z.coerce.number().int().positive("Invalid ID");

/* ─── Quote ─── */
export const createQuoteSchema = z.object({
  recipientName: safeString(100),
  recipientLast: safeString(100),
  recipientCompany: safeString(200),
  title: safeString(300),
  subject: safeString(200),
  clientId: safeId,
  senderId: safeId,
  contactId: z.coerce.number().int().positive().nullable().optional(),
  items: z.array(
    z.object({
      description: z.string().max(1000),
      quantity: z.coerce.number().min(0),
      unitPrice: z.coerce.number().min(0),
      total: z.coerce.number().min(0),
    })
  ).max(50),
  totalAmount: z.coerce.number().min(0),
  notes: safeString(2000).nullable().optional(),
  paymentTerms: safeString(200),
  senderSignature: z.string().max(2_000_000) // ~1.5MB base64 limit
    .refine((s) => !s || s.startsWith("data:image/"), "Invalid signature format")
    .nullable()
    .optional(),
});

/* ─── Signature (public route) ─── */
export const signQuoteSchema = z.object({
  clientSignature: z.string()
    .min(1, "Signature required")
    .max(2_000_000, "Signature too large")
    .refine((s) => s.startsWith("data:image/png;base64,"), "Invalid signature format"),
});

/* ─── Client ─── */
export const createClientSchema = z.object({
  name: safeString(200).pipe(z.string().min(1, "Name required")),
  brand: safeString(200).nullable().optional(),
  paymentTerms: safeString(200).nullable().optional(),
});

export const updateClientSchema = createClientSchema.extend({
  id: safeId,
});

/* ─── Contact ─── */
export const createContactSchema = z.object({
  name: safeString(200).pipe(z.string().min(1, "Name required")),
  email: z.string().email().max(300).nullable().optional().or(z.literal("")),
  phone: safeString(50).nullable().optional(),
  role: safeString(200).nullable().optional(),
});

export const updateContactSchema = createContactSchema.extend({
  id: safeId,
});

/* ─── Sender ─── */
export const createSenderSchema = z.object({
  fullName: safeString(200).pipe(z.string().min(1, "Name required")),
  title: safeString(200).pipe(z.string().min(1, "Title required")),
});

export const updateSenderSchema = createSenderSchema.extend({
  id: safeId,
});

/* ─── Brand ─── */
export const createBrandSchema = z.object({
  name: safeString(200).pipe(z.string().min(1, "Name required")),
});

/* ─── User ─── */
export const createUserSchema = z.object({
  username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, _ only"),
  password: z.string().min(6, "Password min 6 chars").max(100),
  fullName: safeString(200).pipe(z.string().min(1)),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const updateUserSchema = z.object({
  id: safeId,
  fullName: safeString(200).pipe(z.string().min(1)),
  role: z.enum(["USER", "ADMIN"]),
  password: z.string().max(100).optional(),
});

/* ─── Email ─── */
export const sendEmailSchema = z.object({
  to: z.string().email("Invalid email"),
  contactName: safeString(200).optional(),
});

/* ─── Import ─── */
export const importClientsSchema = z.object({
  clients: z.array(
    z.object({
      name: z.string().max(200),
      brand: z.string().max(200).optional().default(""),
      paymentTerms: z.string().max(200).optional().default(""),
    })
  ).min(1, "No data").max(10_000, "Max 10,000 rows"),
});

/* ─── Helper: parse or return 400 ─── */
export function parseOrError<T>(schema: z.ZodSchema<T>, data: unknown):
  { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }
  return { success: true, data: result.data };
}
