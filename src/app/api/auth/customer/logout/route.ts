import { NextResponse } from "next/server";
import { makeContainer } from "@/infrastructure/customer/container";

export async function POST(req: Request) {
  const { logout } = makeContainer();
  await logout.execute();
  const url = new URL(req.url);
  return NextResponse.redirect(`${url.origin}/`, 303);
}
