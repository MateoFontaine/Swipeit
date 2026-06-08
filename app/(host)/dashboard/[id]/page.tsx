import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HostLiveView } from "@/components/host/host-live-view";
import { HostShell } from "@/components/host/host-shell";
import { PollResults } from "@/components/poll/poll-results";
import { CopyLinkButton } from "@/components/polls/copy-link-button";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import { StartPollButton } from "@/components/polls/start-poll-button";
import { getHostPoll } from "@/lib/polls/queries";
import { formatPollDate } from "@/lib/polls/constants";
import { getPollResults } from "@/lib/polls/results";
import { getPollSharePath, getPollShareUrl } from "@/lib/polls/utils";
import { checkPollClosure } from "@/lib/polls/vote-actions";
import { createClient } from "@/lib/supabase/server";
import type { PollOption } from "@/types/database";

type PollDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let poll = await getHostPoll(id);

  if (poll && ["votando", "ballotage"].includes(poll.status)) {
    await checkPollClosure(id);
    poll = await getHostPoll(id);
  }

  if (!poll) {
    notFound();
  }

  const { data: options } = await supabase
    .from("poll_options")
    .select("id, text, sort_order")
    .eq("poll_id", poll.id)
    .order("sort_order", { ascending: true })
    .returns<Pick<PollOption, "id" | "text" | "sort_order">[]>();

  const shareUrl = await getPollShareUrl(poll.share_token);
  const results =
    poll.status === "resultados" || poll.status === "cerrado"
      ? await getPollResults(poll.share_token)
      : null;

  const showLiveView = ["votando", "ballotage"].includes(poll.status);

  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">Tu encuesta</p>
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

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Participantes máx.</dt>
            <dd className="font-semibold">{poll.max_participants}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tiempo límite</dt>
            <dd className="font-semibold">
              {poll.time_limit_minutes
                ? `${poll.time_limit_minutes} min`
                : "Sin límite"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          Creada {formatPollDate(poll.created_at)}
          {poll.closed_at && (
            <> · Cerrada {formatPollDate(poll.closed_at)}</>
          )}
        </p>
      </div>

      {options && options.length > 0 && !results && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Opciones ({options.length})
          </h2>
          <ol className="flex flex-col gap-2">
            {options.map((option, index) => (
              <li
                key={option.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="font-medium">{option.text}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Link para compartir</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviá este link a los participantes para que se unan.
        </p>

        <div className="mt-4 flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <p className="truncate font-mono text-sm text-foreground">
              {shareUrl}
            </p>
          </div>
          <CopyLinkButton url={shareUrl} />
        </div>
      </section>

      {poll.status === "esperando" && (
        <section className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            Cuando todos estén listos, iniciá la votación. Los participantes
            podrán swipear las opciones.
          </p>
          <StartPollButton pollId={poll.id} />
        </section>
      )}

      {showLiveView && (
        <>
          <HostLiveView pollId={poll.id} initialStatus={poll.status} />
          <p className="mt-4 text-center">
            <Link
              href={getPollSharePath(poll.share_token)}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Ver encuesta pública →
            </Link>
          </p>
        </>
      )}

      {results && (
        <section className="mt-6">
          <PollResults pollTitle={poll.title} results={results} />
        </section>
      )}
    </HostShell>
  );
}
