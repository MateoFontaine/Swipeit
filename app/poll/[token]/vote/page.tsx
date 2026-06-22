import { notFound, redirect } from "next/navigation";
import { PollShell } from "@/components/poll/poll-shell";
import { VoteInterface } from "@/components/poll/vote-interface";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import { enrichPollOptionsWithImages } from "@/lib/images/enrich-options";
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

  const rawOptions = await getPollOptionsByShareToken(token);
  const options = await enrichPollOptionsWithImages(rawOptions);

  const isBallotage = poll.status === "ballotage";

  return (
    <PollShell>
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-violet-600">
              {isBallotage ? "Ballotage" : "Votación"}
            </p>
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

        {isBallotage && (
          <p className="mt-4 rounded-xl border border-violet-200/60 bg-violet-500/[0.04] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Segunda vuelta: elegí entre estas {options.length}{" "}
            {options.length === 1 ? "opción" : "opciones"}.
          </p>
        )}
      </header>

      <div className="mt-6 sm:mt-8">
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
