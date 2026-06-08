"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import type { PollLiveStats } from "@/lib/polls/results";
import type { PollStatus } from "@/types";

type HostLiveViewProps = {
  pollId: string;
  initialStatus: PollStatus;
};

const POLL_INTERVAL_MS = 5000;

export function HostLiveView({ pollId, initialStatus }: HostLiveViewProps) {
  const router = useRouter();
  const [stats, setStats] = useState<PollLiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}/live`);
      if (!response.ok) {
        throw new Error("No pudimos cargar los datos en vivo.");
      }
      const data = (await response.json()) as PollLiveStats;
      setStats(data);
      setError(null);
    } catch {
      setError("Error al actualizar. Reintentando…");
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const status = stats?.status ?? initialStatus;
    if (!["esperando", "votando", "ballotage"].includes(status)) {
      return;
    }

    const interval = setInterval(fetchStats, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [stats?.status, initialStatus, fetchStats]);

  useEffect(() => {
    if (
      stats?.status === "votando" ||
      stats?.status === "resultados" ||
      stats?.status === "cerrado"
    ) {
      router.refresh();
    }
  }, [stats?.status, router]);

  if (loading && !stats) {
    return (
      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="text-sm text-rose-800">
          {error ?? "No se pudieron cargar los datos."}
        </p>
      </section>
    );
  }

  const isWaitingRoom = stats.status === "esperando";
  const progressPercent =
    stats.participant_count > 0
      ? Math.round((stats.voted_count / stats.participant_count) * 100)
      : 0;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {isWaitingRoom ? "Sala de espera" : "Vista en vivo"}
        </h2>
        <PollStatusBadge status={stats.status} />
      </div>

      {isWaitingRoom && (
        <p className="mt-2 text-sm text-amber-800">
          Compartí el link y esperá a que se unan todos. Cuando estén listos,
          iniciá la votación.
        </p>
      )}

      {stats.status === "votando" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Los votos se analizan recién cuando todos terminen de votar.
        </p>
      )}

      {stats.status === "ballotage" && (
        <p className="mt-2 text-sm text-violet-700">
          Ballotage en curso. Compartí el link de nuevo para que vuelvan a votar.
        </p>
      )}

      <div
        className={`mt-4 grid gap-3 text-sm ${isWaitingRoom ? "grid-cols-1" : "grid-cols-2"}`}
      >
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-muted-foreground">Participantes</p>
          <p className="mt-0.5 text-xl font-bold">
            {stats.participant_count}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {stats.max_participants}
            </span>
          </p>
        </div>

        {!isWaitingRoom && (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-muted-foreground">Ya votaron</p>
            <p className="mt-0.5 text-xl font-bold">
              {stats.voted_count}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                ({progressPercent}%)
              </span>
            </p>
          </div>
        )}
      </div>

      {!isWaitingRoom && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso de votación</span>
            <span>Round {stats.round}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {isWaitingRoom ? "Unidos" : "Participantes"}
      </h3>
      {stats.participants.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no se unió nadie. Compartí el link de arriba.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {stats.participants.map((participant) => (
            <li
              key={participant.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              <span className="font-medium">{participant.nickname}</span>
              <span
                className={
                  isWaitingRoom
                    ? "text-xs font-semibold text-emerald-700"
                    : participant.has_voted
                      ? "text-xs font-semibold text-emerald-700"
                      : "text-xs text-muted-foreground"
                }
              >
                {isWaitingRoom
                  ? "✓ Unido"
                  : participant.has_voted
                    ? "✓ Votó"
                    : "Esperando"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!isWaitingRoom &&
        (stats.voted_count < stats.participant_count ? (
          <p className="mt-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            El conteo de votos por opción se muestra cuando todos hayan votado.
          </p>
        ) : (
          <>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Conteo por opción
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {stats.partial_counts.map((option) => {
                const maxYes = Math.max(
                  ...stats.partial_counts.map((o) => o.yes_count),
                  1
                );
                const barWidth = Math.round((option.yes_count / maxYes) * 100);

                return (
                  <li
                    key={option.option_id}
                    className="rounded-xl border border-border px-4 py-3 text-sm"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{option.text}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {option.yes_count} sí · {option.no_count} no
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ))}

      {error && <p className="mt-4 text-xs text-amber-700">{error}</p>}

      <p className="mt-4 text-xs text-muted-foreground">
        Se actualiza automáticamente cada {POLL_INTERVAL_MS / 1000} segundos.
      </p>
    </section>
  );
}
