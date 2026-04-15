import { NextResponse } from "next/server";
import { UserError } from "@/lib/commerce/errors";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function formatApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  if (error instanceof UserError) {
    return NextResponse.json(
      { error: error.message, code: "USER_ERROR" },
      { status: 400 }
    );
  }

  console.error("[API Error]", error);

  const detail = (error as any)?.graphqlErrors ?? (error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json(
    { error: "Something went wrong", detail },
    { status: 500 }
  );
}
