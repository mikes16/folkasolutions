"use server";

import { z } from "zod";
import { makeContainer } from "@/infrastructure/customer/container";

// Only firstName + lastName are editable via this mutation. Phone changes
// require a separate SMS verification flow in the Customer Account API;
// marketing consent goes through emailMarketingConsent. Both surface in
// the Profile UI as read-only / hidden until those flows are wired up.
const ProfileSchema = z.object({
  firstName: z.string().trim().min(1, "firstNameRequired").max(50),
  lastName: z.string().trim().min(1, "lastNameRequired").max(50),
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
    });
    return { status: "success" };
  } catch (error) {
    console.error("[account/profile] updateProfile failed", error);
    return { status: "error", genericError: "generic" };
  }
}
