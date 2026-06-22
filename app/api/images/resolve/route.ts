import { NextResponse } from "next/server";
import { resolveOptionImageUrl } from "@/lib/images/resolve-option-images";

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text")?.trim();

  if (!text) {
    return NextResponse.json({ url: null }, { status: 400 });
  }

  const url = await resolveOptionImageUrl(text);
  return NextResponse.json({ url });
}
