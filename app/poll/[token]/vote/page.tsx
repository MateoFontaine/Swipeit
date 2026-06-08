import { notFound, redirect } from "next/navigation";
import { LinkAccountChecker } from "@/components/poll/link-account-banner";
import { PollShell } from "@/components/poll/poll-shell";
import { VoteInterface } from "@/components/poll/vote-interface";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import {
  getPollByShareToken,
  getPollOptionsByShareToken,
} from "@/lib/polls/public-queries";
type VotePageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function VotePage({ params }: VotePageProps) {
  const { token } = await params;

  const poll = await getPollByShareToken(token);

  if (!poll) {
    notFound();
  }

  if (poll.status === "esperando") {
    redirect(`/poll/${token}`);
  }

  if (poll.status === "cerrado" || poll.status === "resultados") {
    redirect(`/poll/${token}`);
  }

  const options = await getPollOptionsByShareToken(token);

  const isBallotage = poll.status === "ballotage";

  return (
    <PollShell>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/6 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">
              {isBallotage ? "Ballotage" : "Votación"}
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {poll.title}
            </h1>
          </div>
          <PollStatusBadge status={poll.status} />
        </div>

        {isBallotage && (
          <p className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 leading-relaxed">
            Segunda vuelta: elegí entre estas {options.length}{" "}
            {options.length === 1 ? "opción" : "opciones"}.
          </p>
        )}
      </div>

      <div className="mt-6">
        <LinkAccountChecker pollId={poll.id} shareToken={token} />
        <VoteInterface
          pollId={poll.id}
          shareToken={token}
          options={options}
          isBallotage={isBallotage}
        />
      </div>
    </PollShell>
  );
}
