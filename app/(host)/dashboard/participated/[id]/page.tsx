import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HostShell } from "@/components/host/host-shell";
import { PollResults } from "@/components/poll/poll-results";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import { formatPollDate } from "@/lib/polls/constants";
import { getParticipantPoll } from "@/lib/polls/queries";
import { getPollResults } from "@/lib/polls/results";
import { getPollSharePath } from "@/lib/polls/utils";
import { createClient } from "@/lib/supabase/server";

type ParticipatedPollPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ParticipatedPollPage({
  params,
}: ParticipatedPollPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const poll = await getParticipantPoll(id);

  if (!poll) {
    notFound();
  }

  const isClosed = poll.status === "resultados" || poll.status === "cerrado";
  const results = isClosed ? await getPollResults(poll.share_token) : null;

  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">Participaste en</p>
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

        <p className="mt-4 text-xs text-muted-foreground">
          {formatPollDate(poll.created_at)}
          {poll.closed_at && (
            <> · Cerrada {formatPollDate(poll.closed_at)}</>
          )}
        </p>
      </div>

      {!isClosed && (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            Encuesta en curso
          </h2>
          <p className="mt-2 text-sm text-amber-800 leading-relaxed">
            Esta encuesta todavía está activa. Podés seguir participando desde el
            link original.
          </p>
          <p className="mt-4">
            <Link
              href={getPollSharePath(poll.share_token)}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Ir a la encuesta →
            </Link>
          </p>
        </section>
      )}

      {results && (
        <section className="mt-6">
          <PollResults pollTitle={poll.title} results={results} />
        </section>
      )}
    </HostShell>
  );
}
