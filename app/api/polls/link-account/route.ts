import { NextResponse } from "next/server";
import { linkParticipantToAccount } from "@/lib/polls/participant-mutations";
import { getParticipantById } from "@/lib/polls/public-queries";

export async function POST(request: Request) {
  let body: { participantId?: string; pollId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Datos inválidos." },
      { status: 400 }
    );
  }

  const { participantId, pollId } = body;

  if (!participantId || !pollId) {
    return NextResponse.json(
      { success: false, error: "Faltan datos para vincular la cuenta." },
      { status: 400 }
    );
  }

  const participant = await getParticipantById(pollId, participantId);

  if (!participant) {
    return NextResponse.json(
      { success: false, error: "No encontramos tu participación." },
      { status: 404 }
    );
  }

  const result = await linkParticipantToAccount(participantId);

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
