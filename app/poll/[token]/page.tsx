import { notFound } from "next/navigation";
import { PollLobby } from "@/components/poll/poll-lobby";
import { PollShell } from "@/components/poll/poll-shell";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import {
  getParticipantByUserId,
  getParticipantCount,
  getPollByShareToken,
} from "@/lib/polls/public-queries";
import { checkPollClosureByToken } from "@/lib/polls/vote-actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

type PollPageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function PollPage({ params }: PollPageProps) {
  const { token } = await params;

  await checkPollClosureByToken(token);

  const poll = await getPollByShareToken(token);

  if (!poll) {
    notFound();
  }

  const participantCount = await getParticipantCount(poll.id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let suggestedNickname = "";
  let accountParticipant: { id: string; nickname: string } | null = null;

  if (user) {
    const existing = await getParticipantByUserId(poll.id, user.id);
    if (existing) {
      accountParticipant = {
        id: existing.id,
        nickname: existing.nickname,
      };
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle<Pick<Profile, "display_name">>();

      suggestedNickname =
        profile?.display_name ?? user.email?.split("@")[0] ?? "";
    }
  }

  return (
    <PollShell>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">Encuesta</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {poll.title}
            </h1>
          </div>
          <PollStatusBadge status={poll.status} />
        </div>

        {poll.description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {poll.description}
          </p>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {participantCount}
          </span>
          {participantCount === 1 ? " participante" : " participantes"}
          {" · máx. "}
          {poll.max_participants}
        </p>
      </div>

      <div className="mt-6">
        <PollLobby
          poll={poll}
          shareToken={token}
          participantCount={participantCount}
          suggestedNickname={suggestedNickname}
          accountParticipant={accountParticipant}
        />
      </div>
    </PollShell>
  );
}
