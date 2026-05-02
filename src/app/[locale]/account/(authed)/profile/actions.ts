"use server";

import { z } from "zod";
import { makeContainer } from "@/infrastructure/customer/container";

/**
 * Phone format: optional leading +, then digits and spaces. Min 10 / max 16
 * counted on the digit-only normalized form (E.164 allows up to 15 digits;
 * 16 leaves a small buffer for stored formatting). Empty string is allowed
 * and treated as "clear the phone" downstream.
 */
const ProfileSchema = z.object({
  firstName: z.string().trim().min(1, "firstNameRequired").max(50),
  lastName: z.string().trim().min(1, "lastNameRequired").max(50),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]*$/, "phoneInvalid")
    .refine(
      (v) => v === "" || v.replace(/\s/g, "").replace(/^\+/, "").length >= 10,
      "phoneTooShort",
    )
    .refine(
      (v) => v === "" || v.replace(/\s/g, "").replace(/^\+/, "").length <= 15,
      "phoneTooLong",
    ),
  acceptsMarketing: z.boolean(),
});

export interface ProfileActionState {
  status: "idle" | "success" | "error";
  fieldErrors?: Record<string, string>;
  genericError?: string;
}

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = ProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const { updateProfile } = makeContainer();
  try {
    await updateProfile.execute({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone === "" ? null : parsed.data.phone,
      acceptsMarketing: parsed.data.acceptsMarketing,
    });
    return { status: "success" };
  } catch (error) {
    console.error("[account/profile] updateProfile failed", error);
    return { status: "error", genericError: "generic" };
  }
}
