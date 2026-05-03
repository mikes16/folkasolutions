"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { makeContainer } from "@/infrastructure/customer/container";

/**
 * Form input contract shared by both the create and edit address actions.
 *
 * Country is constrained to Folka's served markets so users cannot submit
 * a country we have no shipping support for. Phone is optional but, when
 * present, must look like an international phone number. Required text
 * fields are validated as non-empty after trim because the underlying
 * `Address` value object will throw on empty strings anyway and we'd
 * rather catch that at the boundary with a localized message.
 */
const COUNTRY_CODES = ["MX", "US"] as const;

const AddressSchema = z.object({
  firstName: z.string().trim().min(1, "required").max(50),
  lastName: z.string().trim().min(1, "required").max(50),
  company: z.string().trim().max(100).optional(),
  address1: z.string().trim().min(1, "required").max(200),
  address2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "required").max(100),
  provinceCode: z.string().trim().min(1, "required").max(40),
  countryCode: z.enum(COUNTRY_CODES, { message: "countryInvalid" }),
  zip: z
    .string()
    .trim()
    .min(3, "zipInvalid")
    .max(12, "zipInvalid")
    .regex(/^[A-Za-z0-9 \-]+$/, "zipInvalid"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]*$/, "phoneInvalid")
    .refine(
      (v) => v === "" || v.replace(/\s/g, "").replace(/^\+/, "").length >= 10,
      "phoneInvalid",
    )
    .refine(
      (v) => v === "" || v.replace(/\s/g, "").replace(/^\+/, "").length <= 15,
      "phoneInvalid",
    )
    .optional(),
  setDefault: z.boolean(),
});

export interface AddressActionState {
  status: "idle" | "error";
  fieldErrors?: Record<string, string>;
  genericError?: string;
  /** Echoed values so the form can re-render with the user's input. */
  values?: Record<string, string | boolean>;
}

/**
 * Pulls a string field from FormData, returning empty string when missing.
 * Centralized so all address actions parse FormData identically.
 */
function readForm(formData: FormData) {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    company: get("company"),
    address1: get("address1"),
    address2: get("address2"),
    city: get("city"),
    provinceCode: get("provinceCode"),
    countryCode: get("countryCode"),
    zip: get("zip"),
    phone: get("phone"),
    setDefault: formData.get("setDefault") === "on",
  };
}

function collectFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

export async function createAddressAction(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const raw = readForm(formData);
  const parsed = AddressSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: collectFieldErrors(parsed.error),
      values: raw,
    };
  }

  const { createAddress } = makeContainer();
  try {
    await createAddress.execute({
      input: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        company: parsed.data.company || undefined,
        address1: parsed.data.address1,
        address2: parsed.data.address2 || undefined,
        city: parsed.data.city,
        provinceCode: parsed.data.provinceCode,
        countryCode: parsed.data.countryCode,
        zip: parsed.data.zip,
        phone: parsed.data.phone ? parsed.data.phone : undefined,
      },
      setDefault: parsed.data.setDefault,
    });
  } catch (error) {
    console.error("[account/addresses] createAddress failed", error);
    return { status: "error", genericError: "generic", values: raw };
  }

  // Bust the cached list and the dashboard so the new address appears.
  revalidatePath("/[locale]/account/addresses", "page");
  revalidatePath("/[locale]/account", "page");

  // Locale comes from the form action URL, but redirecting to a
  // locale-prefixed path requires the actual locale string. We embed it
  // in a hidden input on the form (`locale`) to avoid coupling actions
  // to the request URL.
  const locale = readLocale(formData);
  redirect(`/${locale}/account/addresses`);
}

export async function updateAddressAction(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || addressId === "") {
    return { status: "error", genericError: "generic" };
  }

  const raw = readForm(formData);
  const parsed = AddressSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: collectFieldErrors(parsed.error),
      values: raw,
    };
  }

  const { updateAddress } = makeContainer();
  try {
    await updateAddress.execute({
      addressId,
      input: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        company: parsed.data.company || undefined,
        address1: parsed.data.address1,
        address2: parsed.data.address2 || undefined,
        city: parsed.data.city,
        provinceCode: parsed.data.provinceCode,
        countryCode: parsed.data.countryCode,
        zip: parsed.data.zip,
        phone: parsed.data.phone ? parsed.data.phone : undefined,
      },
    });
  } catch (error) {
    console.error("[account/addresses] updateAddress failed", error);
    return { status: "error", genericError: "generic", values: raw };
  }

  revalidatePath("/[locale]/account/addresses", "page");
  revalidatePath("/[locale]/account", "page");

  const locale = readLocale(formData);
  redirect(`/${locale}/account/addresses`);
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || addressId === "") {
    // Nothing to do; bail silently rather than throwing on a broken DOM.
    return;
  }
  const { deleteAddress } = makeContainer();
  try {
    await deleteAddress.execute(addressId);
  } catch (error) {
    console.error("[account/addresses] deleteAddress failed", error);
    // Re-throw so Next.js surfaces the failure to the error boundary
    // rather than silently leaving the address visible.
    throw error;
  }
  revalidatePath("/[locale]/account/addresses", "page");
  revalidatePath("/[locale]/account", "page");
}

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "es";
}
