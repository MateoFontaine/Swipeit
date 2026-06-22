import { getMedalEmoji, voteLabel } from "@/lib/polls/results-format";
import type { PollResultsData } from "@/lib/polls/results";

type PollResultsProps = {
  pollTitle: string;
  results: PollResultsData;
};

export function PollResults({ pollTitle, results }: PollResultsProps) {
  const winners = results.ranking.filter((entry) => entry.is_winner);

  return (
    <section>
      <p className="text-sm font-medium text-violet-600">Resultados</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
        {pollTitle}
      </h2>
      <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />

      {results.round === 2 && (
        <p className="mt-4 text-sm text-violet-700">
          Después del ballotage (segunda vuelta)
        </p>
      )}

      {results.is_tie ? (
        <div className="mt-5 rounded-xl border border-amber-200/70 bg-amber-50/80 px-4 py-3">
          <p className="font-semibold text-amber-900">Empate final</p>
          <p className="mt-1 text-sm text-amber-800">
            {winners.map((w) => w.text).join(" · ")}
          </p>
        </div>
      ) : winners.length > 0 ? (
        <div className="mt-5 rounded-xl border border-violet-200/60 bg-violet-500/[0.06] px-4 py-4">
          <p className="text-sm font-medium text-violet-600">Ganador</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">
            {winners[0].text}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {voteLabel(winners[0].yes_count)}
          </p>
        </div>
      ) : null}

      <h3 className="mt-8 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Ranking completo
      </h3>

      <ol className="mt-3 flex flex-col gap-2.5">
        {results.ranking.map((entry, index) => {
          const maxCount = results.ranking[0]?.yes_count ?? 1;
          const barWidth =
            maxCount > 0 ? Math.round((entry.yes_count / maxCount) * 100) : 0;

          return (
            <li
              key={entry.option_id}
              className="rounded-xl border border-border/60 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tracking-tight">
                    <span className="mr-1.5 text-muted-foreground" aria-hidden>
                      {getMedalEmoji(index)}
                    </span>
                    {entry.text}
                    {entry.is_winner && !results.is_tie && (
                      <span className="ml-2 text-xs font-medium text-violet-600">
                        Ganador
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {voteLabel(entry.yes_count)}
                  </p>
                </div>
              </div>

              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {entry.yes_voters.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Votaron sí:{" "}
                  <span className="font-medium text-foreground">
                    {entry.yes_voters.join(", ")}
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
