"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  createAddressAction,
  updateAddressAction,
  type AddressActionState,
} from "@/app/[locale]/account/(authed)/addresses/actions";

interface FormLabels {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  zip: string;
  phone: string;
  setDefault: string;
}

interface FormErrorMessages {
  required: string;
  phoneInvalid: string;
  zipInvalid: string;
  countryInvalid: string;
  generic: string;
}

interface FormActions {
  save: string;
  saving: string;
  cancel: string;
}

export interface AddressFormInitialValues {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  zip: string;
  phone: string;
  setDefault: boolean;
}

interface Props {
  /** Locale to embed in the hidden input so the action can redirect. */
  locale: string;
  /**
   * When set, the form posts to `updateAddressAction` with this id;
   * otherwise it posts to `createAddressAction`.
   */
  addressId?: string;
  initial: AddressFormInitialValues;
  cancelHref: string;
  labels: FormLabels;
  actions: FormActions;
  errorMessages: FormErrorMessages;
}

const initialState: AddressActionState = { status: "idle" };

type RequiredFieldName =
  | "firstName"
  | "lastName"
  | "address1"
  | "city"
  | "provinceCode"
  | "zip";

type OptionalFieldName = "company" | "address2" | "phone";

type FieldName = RequiredFieldName | OptionalFieldName;

export function AddressForm(props: Props) {
  const action = props.addressId
    ? updateAddressAction
    : createAddressAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});

  // After server-side rejection, push focus to the first invalid field
  // so keyboard users land on the problem.
  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      const firstBad = Object.keys(state.fieldErrors)[0];
      if (firstBad) {
        const el = document.getElementById(firstBad);
        if (el instanceof HTMLElement) el.focus();
      }
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
    if (
      field === "firstName" ||
      field === "lastName" ||
      field === "address1" ||
      field === "city" ||
      field === "provinceCode"
    ) {
      if (!value.trim()) {
        setError(field, props.errorMessages.required);
        return;
      }
      clearError(field);
      return;
    }
    if (field === "zip") {
      const trimmed = value.trim();
      if (!trimmed) {
        setError("zip", props.errorMessages.required);
        return;
      }
      if (!/^[A-Za-z0-9 \-]{3,12}$/.test(trimmed)) {
        setError("zip", props.errorMessages.zipInvalid);
        return;
      }
      clearError("zip");
      return;
    }
    if (field === "phone") {
      if (value.trim() === "") {
        clearError("phone");
        return;
      }
      if (!/^\+?[0-9 ]+$/.test(value)) {
        setError("phone", props.errorMessages.phoneInvalid);
        return;
      }
      const digits = value.replace(/\s/g, "").replace(/^\+/, "");
      if (digits.length < 10 || digits.length > 15) {
        setError("phone", props.errorMessages.phoneInvalid);
        return;
      }
      clearError("phone");
      return;
    }
    // company / address2: nothing to validate.
    clearError(field);
  }

  const serverErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const echoed =
    state.status === "error" && state.values ? state.values : null;

  function errorFor(field: FieldName): string | undefined {
    const code = serverErrors[field];
    if (code) {
      const key = code as keyof FormErrorMessages;
      return props.errorMessages[key] ?? props.errorMessages.generic;
    }
    return blurErrors[field];
  }

  // Resolve the value rendered for each input. After a server-side
  // validation error we re-render the user's last input so they don't
  // lose typing; otherwise we use the prop-provided initial value.
  function valueFor(field: FieldName): string {
    if (echoed) {
      const v = echoed[field];
      return typeof v === "string" ? v : "";
    }
    return props.initial[field];
  }

  const setDefaultChecked = echoed
    ? Boolean(echoed.setDefault)
    : props.initial.setDefault;
  const countryValue = echoed
    ? typeof echoed.countryCode === "string"
      ? echoed.countryCode
      : props.initial.countryCode
    : props.initial.countryCode;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <input type="hidden" name="locale" value={props.locale} />
      {props.addressId ? (
        <input type="hidden" name="addressId" value={props.addressId} />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          id="firstName"
          name="firstName"
          label={props.labels.firstName}
          value={valueFor("firstName")}
          error={errorFor("firstName")}
          onBlur={(v) => blurValidate("firstName", v)}
          required
        />
        <Field
          id="lastName"
          name="lastName"
          label={props.labels.lastName}
          value={valueFor("lastName")}
          error={errorFor("lastName")}
          onBlur={(v) => blurValidate("lastName", v)}
          required
        />
      </div>

      <Field
        id="company"
        name="company"
        label={props.labels.company}
        value={valueFor("company")}
        error={errorFor("company")}
        onBlur={(v) => blurValidate("company", v)}
      />

      <Field
        id="address1"
        name="address1"
        label={props.labels.address1}
        value={valueFor("address1")}
        error={errorFor("address1")}
        onBlur={(v) => blurValidate("address1", v)}
        required
      />

      <Field
        id="address2"
        name="address2"
        label={props.labels.address2}
        value={valueFor("address2")}
        error={errorFor("address2")}
        onBlur={(v) => blurValidate("address2", v)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          id="city"
          name="city"
          label={props.labels.city}
          value={valueFor("city")}
          error={errorFor("city")}
          onBlur={(v) => blurValidate("city", v)}
          required
        />
        <Field
          id="provinceCode"
          name="provinceCode"
          label={props.labels.provinceCode}
          value={valueFor("provinceCode")}
          error={errorFor("provinceCode")}
          onBlur={(v) => blurValidate("provinceCode", v)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CountrySelect
          id="countryCode"
          name="countryCode"
          label={props.labels.countryCode}
          value={countryValue}
          error={
            serverErrors.countryCode
              ? props.errorMessages.countryInvalid
              : undefined
          }
        />
        <Field
          id="zip"
          name="zip"
          label={props.labels.zip}
          value={valueFor("zip")}
          error={errorFor("zip")}
          onBlur={(v) => blurValidate("zip", v)}
          required
        />
      </div>

      <Field
        id="phone"
        name="phone"
        type="tel"
        label={props.labels.phone}
        value={valueFor("phone")}
        error={errorFor("phone")}
        onBlur={(v) => blurValidate("phone", v)}
      />

      <label className="flex items-start gap-3 text-foreground cursor-pointer">
        <input
          type="checkbox"
          name="setDefault"
          defaultChecked={setDefaultChecked}
          className="mt-1 h-4 w-4 border border-foreground/40 cursor-pointer accent-primary"
        />
        <span className="text-sm">{props.labels.setDefault}</span>
      </label>

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

      <div className="flex flex-col-reverse md:flex-row md:items-center gap-4 pt-4">
        <Link
          href={props.cancelHref}
          className="text-center md:text-left font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm text-foreground/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {props.actions.cancel}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="md:ml-auto px-8 py-4 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground inline-flex items-center justify-center gap-3"
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
    </form>
  );
}

interface FieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  error?: string;
  onBlur: (value: string) => void;
  required?: boolean;
}

function Field({
  id,
  name,
  type = "text",
  label,
  value,
  error,
  onBlur,
  required,
}: FieldProps) {
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
        defaultValue={value}
        onBlur={(e) => onBlur(e.currentTarget.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
        aria-required={required ? "true" : undefined}
        className="w-full px-4 py-3 bg-background border border-foreground/30 text-foreground focus:border-foreground focus:outline-none transition-colors duration-150"
      />
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

interface CountrySelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
}

function CountrySelect({ id, name, label, value, error }: CountrySelectProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/70 mb-2"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value || "MX"}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
        className="w-full px-4 py-3 bg-background border border-foreground/30 text-foreground focus:border-foreground focus:outline-none transition-colors duration-150"
      >
        <option value="MX">México</option>
        <option value="US">United States</option>
      </select>
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
