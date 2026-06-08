import { NextResponse } from "next/server";
import { getPollLiveStats } from "@/lib/polls/results";
import { getHostPoll } from "@/lib/polls/queries";
import { checkPollClosure } from "@/lib/polls/vote-actions";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const poll = await getHostPoll(id);

  if (!poll) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (["votando", "ballotage"].includes(poll.status)) {
    await checkPollClosure(id);
  }

  const stats = await getPollLiveStats(id);

  if (!stats) {
    return NextResponse.json(
      { error: "No se pudieron cargar los datos" },
      { status: 500 }
    );
  }

  return NextResponse.json(stats);
}
