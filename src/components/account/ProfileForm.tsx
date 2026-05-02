"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/app/[locale]/account/(authed)/profile/actions";

interface ErrorMessages {
  firstNameRequired: string;
  lastNameRequired: string;
  phoneInvalid: string;
  phoneTooShort: string;
  phoneTooLong: string;
  generic: string;
}

interface Props {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    acceptsMarketing: boolean;
  };
  labels: {
    firstName: string;
    lastName: string;
    phone: string;
    acceptsMarketing: string;
  };
  helpers: { phone: string; marketing: string };
  actions: { save: string; saving: string; success: string };
  errorMessages: ErrorMessages;
}

const initialState: ProfileActionState = { status: "idle" };

type FieldName = "firstName" | "lastName" | "phone";

export function ProfileForm(props: Props) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // After server-side validation rejects the submit, push focus to the
  // first invalid field so keyboard users land on the problem.
  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      const firstBad = Object.keys(state.fieldErrors)[0];
      if (firstBad) {
        const el = document.getElementById(firstBad);
        if (el instanceof HTMLElement) el.focus();
      }
    }
  }, [state]);

  // Show a transient success message that auto-dismisses after 3s. The
  // server action returns status="success" once per submit; this effect
  // mirrors that into a local boolean we control.
  useEffect(() => {
    if (state.status === "success") {
      setShowSuccess(true);
      const id = window.setTimeout(() => setShowSuccess(false), 3000);
      return () => window.clearTimeout(id);
    }
  }, [state]);

  function clearError(field: FieldName) {
    setBlurErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function setError(field: FieldName, message: string) {
    setBlurErrors((prev) => ({ ...prev, [field]: message }));
  }

  function blurValidate(field: FieldName, value: string) {
    if (field === "firstName") {
      if (!value.trim()) {
        setError("firstName", props.errorMessages.firstNameRequired);
        return;
      }
      clearError("firstName");
      return;
    }
    if (field === "lastName") {
      if (!value.trim()) {
        setError("lastName", props.errorMessages.lastNameRequired);
        return;
      }
      clearError("lastName");
      return;
    }
    // phone: empty is allowed (clears the field server-side)
    if (value.trim() === "") {
      clearError("phone");
      return;
    }
    if (!/^\+?[0-9 ]+$/.test(value)) {
      setError("phone", props.errorMessages.phoneInvalid);
      return;
    }
    const digits = value.replace(/\s/g, "").replace(/^\+/, "");
    if (digits.length < 10) {
      setError("phone", props.errorMessages.phoneTooShort);
      return;
    }
    if (digits.length > 15) {
      setError("phone", props.errorMessages.phoneTooLong);
      return;
    }
    clearError("phone");
  }

  const serverErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};

  function errorFor(field: FieldName): string | undefined {
    const code = serverErrors[field];
    if (code) {
      // Server returns a Zod error code; map to the localized string.
      const key = code as keyof ErrorMessages;
      return props.errorMessages[key] ?? props.errorMessages.generic;
    }
    return blurErrors[field];
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <Field
        id="firstName"
        name="firstName"
        label={props.labels.firstName}
        defaultValue={props.initial.firstName}
        error={errorFor("firstName")}
        onBlur={(v) => blurValidate("firstName", v)}
      />
      <Field
        id="lastName"
        name="lastName"
        label={props.labels.lastName}
        defaultValue={props.initial.lastName}
        error={errorFor("lastName")}
        onBlur={(v) => blurValidate("lastName", v)}
      />
      <Field
        id="phone"
        name="phone"
        type="tel"
        label={props.labels.phone}
        defaultValue={props.initial.phone}
        helper={props.helpers.phone}
        error={errorFor("phone")}
        onBlur={(v) => blurValidate("phone", v)}
      />

      <div>
        <label className="flex items-start gap-3 text-foreground cursor-pointer">
          <input
            type="checkbox"
            name="acceptsMarketing"
            defaultChecked={props.initial.acceptsMarketing}
            className="mt-1 h-4 w-4 border border-foreground/40 cursor-pointer accent-primary"
          />
          <span className="text-sm">{props.labels.acceptsMarketing}</span>
        </label>
        <p className="mt-2 ml-7 text-xs text-foreground/60">
          {props.helpers.marketing}
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground inline-flex items-center justify-center gap-3"
        >
          {isPending && (
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin"
            />
          )}
          {isPending ? props.actions.saving : props.actions.save}
        </button>
      </div>

      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="border-l-[3px] border-[oklch(45%_0.12_145)] pl-4 py-3"
        >
          <p className="text-sm text-[oklch(45%_0.12_145)]">
            {props.actions.success}
          </p>
        </div>
      )}

      {state.status === "error" && state.genericError && (
        <div
          role="alert"
          className="border-l-[3px] border-[oklch(50%_0.18_28)] pl-4 py-3"
        >
          <p className="text-sm text-[oklch(50%_0.18_28)]">
            {props.errorMessages.generic}
          </p>
        </div>
      )}
    </form>
  );
}

interface FieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  defaultValue: string;
  helper?: string;
  error?: string;
  onBlur: (value: string) => void;
}

function Field({
  id,
  name,
  type = "text",
  label,
  defaultValue,
  helper,
  error,
  onBlur,
}: FieldProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/70 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        onBlur={(e) => onBlur(e.currentTarget.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId ?? helperId}
        className="w-full px-4 py-3 bg-background border border-foreground/30 text-foreground focus:border-foreground focus:outline-none transition-colors duration-150"
      />
      {helper && !error && (
        <p id={helperId} className="mt-2 text-xs text-foreground/60">
          {helper}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-xs text-[oklch(50%_0.18_28)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
