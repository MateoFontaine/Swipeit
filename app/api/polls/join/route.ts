import { NextResponse } from "next/server";
import { joinPoll } from "@/lib/polls/participant-mutations";

export async function POST(request: Request) {
  let body: { shareToken?: string; nickname?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Datos inválidos." },
      { status: 400 }
    );
  }

  if (!body.shareToken || !body.nickname) {
    return NextResponse.json(
      { success: false, error: "Faltan datos para unirse." },
      { status: 400 }
    );
  }

  const result = await joinPoll(body.shareToken, body.nickname);
  const status = result.success ? 200 : 400;

  return NextResponse.json(result, { status });
}
