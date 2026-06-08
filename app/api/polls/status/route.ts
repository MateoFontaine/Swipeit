import { NextResponse } from "next/server";
import { getPollByShareToken } from "@/lib/polls/public-queries";
import { checkPollClosureByToken } from "@/lib/polls/vote-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  await checkPollClosureByToken(token);

  const poll = await getPollByShareToken(token);

  if (!poll) {
    return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ status: poll.status });
}
