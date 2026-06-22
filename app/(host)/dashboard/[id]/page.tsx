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
import { enrichPollOptionsWithImages } from "@/lib/images/enrich-options";
import { FinalizePollButton } from "@/components/polls/finalize-poll-button";
import { getBallotageOptions, getPollResults } from "@/lib/polls/results";
import { getPollSharePath, getPollShareUrl } from "@/lib/polls/utils";
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

  const poll = await getHostPoll(id);

  if (!poll) {
    notFound();
  }

  const { data: rawOptions } = await supabase
    .from("poll_options")
    .select("id, poll_id, text, image_url, sort_order")
    .eq("poll_id", poll.id)
    .order("sort_order", { ascending: true })
    .returns<PollOption[]>();

  const options = rawOptions
    ? await enrichPollOptionsWithImages(rawOptions, { persist: true })
    : null;

  const shareUrl = await getPollShareUrl(poll.share_token);
  const results =
    poll.status === "resultados" || poll.status === "cerrado"
      ? await getPollResults(poll.share_token)
      : null;

  const showLiveView = ["esperando", "votando", "ballotage"].includes(
    poll.status
  );
  const ballotageOptions =
    poll.status === "ballotage" ? await getBallotageOptions(poll.id) : [];

  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-violet-600">Tu encuesta</p>
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

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-border/60 bg-violet-500/[0.03] px-4 py-3">
            <dt className="text-muted-foreground">Participantes máx.</dt>
            <dd className="mt-0.5 font-semibold">{poll.max_participants}</dd>
          </div>
          <div className="rounded-xl border border-border/60 bg-violet-500/[0.03] px-4 py-3">
            <dt className="text-muted-foreground">Tiempo límite</dt>
            <dd className="mt-0.5 font-semibold">
              {poll.time_limit_minutes
                ? `${poll.time_limit_minutes} min`
                : "Sin límite"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          Creada {formatPollDate(poll.created_at)}
          {poll.closed_at && <> · Cerrada {formatPollDate(poll.closed_at)}</>}
        </p>
      </header>

      {options && options.length > 0 && !results && (
        <section className="mt-8">
          <p className="text-sm font-medium text-violet-600">Opciones</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {options.length} opciones
          </h2>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />
          <ol className="mt-4 flex flex-col gap-2">
            {options.map((option, index) => (
              <li
                key={option.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-semibold text-violet-600">
                  {index + 1}
                </span>
                <span className="font-medium">{option.text}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-8">
        <p className="text-sm font-medium text-violet-600">Compartir</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Link para participantes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviá este link para que se unan y voten.
        </p>

        <div className="mt-4 flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border/60 bg-violet-500/[0.03] px-4 py-3">
            <p className="truncate font-mono text-sm text-foreground">
              {shareUrl}
            </p>
          </div>
          <CopyLinkButton url={shareUrl} />
        </div>
      </section>

      {showLiveView && (
        <HostLiveView pollId={poll.id} initialStatus={poll.status} />
      )}

      {poll.status === "esperando" && (
        <section className="mt-8">
          <p className="text-sm font-medium text-violet-600">Listo para votar</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Iniciar votación
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Compartí el link y esperá a que se unan. Se necesitan al menos 2
            participantes.
          </p>
          <div className="mt-5">
            <StartPollButton pollId={poll.id} />
          </div>
        </section>
      )}

      {poll.status === "ballotage" && (
        <section className="mt-8 rounded-xl border border-violet-200/60 bg-violet-500/[0.04] p-5 sm:p-6">
          <p className="text-sm font-medium text-violet-600">Ballotage</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Hubo empate
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Compartí el link de nuevo para que voten entre las opciones
            empatadas.
          </p>

          {ballotageOptions.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {ballotageOptions.map((option) => (
                <li
                  key={option.id}
                  className="rounded-xl border border-violet-200/50 bg-background px-4 py-2.5 text-sm font-medium"
                >
                  {option.text}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-violet-200/50 bg-background px-4 py-3">
              <p className="truncate font-mono text-sm">{shareUrl}</p>
            </div>
            <CopyLinkButton url={shareUrl} />
          </div>

          <div className="mt-5">
            <FinalizePollButton pollId={poll.id} />
          </div>
        </section>
      )}

      {poll.status === "votando" && (
        <p className="mt-6 text-center">
          <Link
            href={getPollSharePath(poll.share_token)}
            className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
          >
            Ver encuesta pública →
          </Link>
        </p>
      )}

      {results && (
        <section className="mt-8">
          <PollResults pollTitle={poll.title} results={results} />
        </section>
      )}
    </HostShell>
  );
}
