import { NextResponse } from "next/server";
import { startPoll } from "@/lib/polls/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await startPoll(id);
  const status = result.success ? 200 : 400;

  return NextResponse.json(result, { status });
}
