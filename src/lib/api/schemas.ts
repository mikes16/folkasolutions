import { z } from "zod";

const cartLineInput = z.object({
  merchandiseId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const cartLineUpdate = z.object({
  id: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});

const localeFields = {
  country: z.string().optional(),
  language: z.string().optional(),
};

export const CartActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), ...localeFields }),
  z.object({ action: z.literal("get"), cartId: z.string().min(1), ...localeFields }),
  z.object({
    action: z.literal("add"),
    cartId: z.string().min(1),
    lines: z.array(cartLineInput).min(1),
    ...localeFields,
  }),
  z.object({
    action: z.literal("update"),
    cartId: z.string().min(1),
    lines: z.array(cartLineUpdate).min(1),
    ...localeFields,
  }),
  z.object({
    action: z.literal("remove"),
    cartId: z.string().min(1),
    lineIds: z.array(z.string().min(1)).min(1),
    ...localeFields,
  }),
  z.object({
    action: z.literal("updateAttributes"),
    cartId: z.string().min(1),
    attributes: z
      .array(z.object({ key: z.string().min(1), value: z.string() }))
      .min(1),
    ...localeFields,
  }),
]);

export type CartAction = z.infer<typeof CartActionSchema>;

export const SearchParamsSchema = z.object({
  q: z.string().default(""),
  country: z.string().optional(),
  language: z.string().optional(),
});

export const CollectionProductsParamsSchema = z.object({
  after: z.string().optional(),
  sort: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  first: z.coerce.number().int().positive().max(100).default(40),
  brand: z.string().optional(),
  type: z.string().optional(),
  price: z.string().optional(),
});

export const ShopProductsParamsSchema = z.object({
  after: z.string().optional(),
  sort: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  first: z.coerce.number().int().positive().max(100).default(24),
  brand: z.string().optional(),
  type: z.string().optional(),
  price: z.string().optional(),
});
