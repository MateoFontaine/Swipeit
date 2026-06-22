import { notFound } from "next/navigation";
import { LinkAccountChecker } from "@/components/poll/link-account-banner";
import { PollLobby } from "@/components/poll/poll-lobby";
import { PollResults } from "@/components/poll/poll-results";
import { PollShell } from "@/components/poll/poll-shell";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import {
  getParticipantByUserId,
  getParticipantCount,
  getPollByShareToken,
} from "@/lib/polls/public-queries";
import { finalizePoll, getPollResults } from "@/lib/polls/results";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

type PollPageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function PollPage({ params }: PollPageProps) {
  const { token } = await params;

  const poll = await getPollByShareToken(token);

  if (!poll) {
    notFound();
  }

  if (poll.status === "resultados") {
    await finalizePoll(poll.id);
    const refreshed = await getPollByShareToken(token);
    if (refreshed) {
      Object.assign(poll, refreshed);
    }
  }

  const participantCount = await getParticipantCount(poll.id);
  const results =
    poll.status === "resultados" || poll.status === "cerrado"
      ? await getPollResults(token)
      : null;

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
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-violet-600">Encuesta</p>
            <h1 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
              {poll.title}
            </h1>
          </div>
          <PollStatusBadge status={poll.status} className="shrink-0" />
        </div>
        <div
          className="mt-4 h-0.5 w-8 rounded-full bg-violet-500"
          aria-hidden
        />

        {poll.description && (
          <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground">
            {poll.description}
          </p>
        )}

        {!results && (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {participantCount}
            </span>
            {participantCount === 1 ? " participante" : " participantes"}
            {" · máx. "}
            {poll.max_participants}
          </p>
        )}
      </header>

      <div className="mt-8">
        {results ? (
          <>
            <PollResults pollTitle={poll.title} results={results} />
            <LinkAccountChecker pollId={poll.id} shareToken={token} />
          </>
        ) : (
          <PollLobby
            poll={poll}
            shareToken={token}
            participantCount={participantCount}
            suggestedNickname={suggestedNickname}
            accountParticipant={accountParticipant}
          />
        )}
      </div>
    </PollShell>
  );
}
