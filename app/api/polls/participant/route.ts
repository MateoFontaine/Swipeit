import { NextResponse } from "next/server";
import { getParticipantById } from "@/lib/polls/public-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get("pollId");
  const participantId = searchParams.get("participantId");

  if (!pollId || !participantId) {
    return NextResponse.json(
      { valid: false, error: "Parámetros inválidos." },
      { status: 400 }
    );
  }

  const participant = await getParticipantById(pollId, participantId);

  if (!participant) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    participantId: participant.id,
    nickname: participant.nickname,
  });
}
