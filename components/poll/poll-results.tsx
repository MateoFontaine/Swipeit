import { getMedalEmoji, voteLabel } from "@/lib/polls/results-format";
import type { PollResultsData } from "@/lib/polls/results";

type PollResultsProps = {
  pollTitle: string;
  results: PollResultsData;
};

export function PollResults({ pollTitle, results }: PollResultsProps) {
  const winners = results.ranking.filter((entry) => entry.is_winner);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/6">
      <p className="text-sm font-medium text-accent">Resultados</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight">{pollTitle}</h2>

      {results.round === 2 && (
        <p className="mt-2 text-sm text-violet-700">
          Después del ballotage (segunda vuelta)
        </p>
      )}

      {results.is_tie ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="font-semibold text-amber-900">¡Empate final!</p>
          <p className="mt-1 text-sm text-amber-800">
            {winners.map((w) => w.text).join(" · ")}
          </p>
        </div>
      ) : winners.length > 0 ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-700">Ganador</p>
          <p className="mt-0.5 text-lg font-bold text-emerald-900">
            🏆 {winners[0].text}
          </p>
          <p className="text-sm text-emerald-700">
            {voteLabel(winners[0].yes_count)}
          </p>
        </div>
      ) : null}

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Ranking completo
      </h3>

      <ol className="mt-3 flex flex-col gap-3">
        {results.ranking.map((entry, index) => {
          const maxCount = results.ranking[0]?.yes_count ?? 1;
          const barWidth =
            maxCount > 0 ? Math.round((entry.yes_count / maxCount) * 100) : 0;

          return (
            <li
              key={entry.option_id}
              className="rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    <span className="mr-1.5" aria-hidden="true">
                      {getMedalEmoji(index)}
                    </span>
                    {entry.text}
                    {entry.is_winner && !results.is_tie && (
                      <span className="ml-2 text-xs font-semibold text-emerald-600">
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
                className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all"
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
    </div>
  );
}
