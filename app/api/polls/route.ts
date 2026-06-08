import { NextResponse } from "next/server";
import { createPoll } from "@/lib/polls/mutations";
import type { CreatePollInput } from "@/lib/polls/validation";

export async function POST(request: Request) {
  let body: CreatePollInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Datos inválidos." },
      { status: 400 }
    );
  }

  const result = await createPoll(body);
  const status = result.success ? 200 : 400;

  return NextResponse.json(result, { status });
}
