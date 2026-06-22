"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PollStatusBadge } from "@/components/polls/poll-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PollLiveStats } from "@/lib/polls/results";
import type { PollStatus } from "@/types";

type HostLiveViewProps = {
  pollId: string;
  initialStatus: PollStatus;
};

const POLL_INTERVAL_MS = 5000;

function HostLiveViewSkeleton() {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-full max-w-sm" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
      <div className="mt-6 flex flex-col gap-2">
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
    </section>
  );
}

export function HostLiveView({ pollId, initialStatus }: HostLiveViewProps) {
  const router = useRouter();
  const [stats, setStats] = useState<PollLiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevStatusRef = useRef<PollStatus>(initialStatus);

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
    if (!stats) return;

    const prev = prevStatusRef.current;
    const next = stats.status;
    if (prev === next) return;

    prevStatusRef.current = next;

    if (
      next === "votando" ||
      next === "ballotage" ||
      next === "resultados" ||
      next === "cerrado"
    ) {
      router.refresh();
    }
  }, [stats, router]);

  if (loading && !stats) {
    return <HostLiveViewSkeleton />;
  }

  if (!stats) {
    return (
      <section className="mt-8 rounded-xl border border-red-200/80 bg-red-50/80 px-5 py-4">
        <p className="text-sm text-red-700">
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
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-violet-600">
            {isWaitingRoom ? "Sala de espera" : "En vivo"}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {isWaitingRoom ? "Esperando participantes" : "Vista en vivo"}
          </h2>
        </div>
        <PollStatusBadge status={stats.status} />
      </div>

      {isWaitingRoom && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Compartí el link y esperá a que se unan. Cuando estén listos, iniciá
          la votación.
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
        className={`mt-5 grid gap-3 text-sm ${isWaitingRoom ? "grid-cols-1" : "grid-cols-2"}`}
      >
        <div className="rounded-xl border border-border/60 bg-violet-500/[0.03] px-4 py-3">
          <p className="text-muted-foreground">Participantes</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight">
            {stats.participant_count}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {stats.max_participants}
            </span>
          </p>
        </div>

        {!isWaitingRoom && (
          <div className="rounded-xl border border-border/60 bg-violet-500/[0.03] px-4 py-3">
            <p className="text-muted-foreground">Ya votaron</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight">
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
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <h3 className="mt-6 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
              className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-2.5 text-sm"
            >
              <span className="font-medium">{participant.nickname}</span>
              <span
                className={
                  isWaitingRoom || participant.has_voted
                    ? "text-xs font-medium text-violet-600"
                    : "text-xs text-muted-foreground"
                }
              >
                {isWaitingRoom
                  ? "Unido"
                  : participant.has_voted
                    ? "Votó"
                    : "Esperando"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!isWaitingRoom &&
        (stats.voted_count < stats.participant_count ? (
          <p className="mt-6 rounded-xl border border-border/60 bg-violet-500/[0.03] px-4 py-3 text-sm text-muted-foreground">
            El conteo por opción se muestra cuando todos hayan votado.
          </p>
        ) : (
          <>
            <h3 className="mt-6 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
                    className="rounded-xl border border-border/60 px-4 py-3 text-sm"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{option.text}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {option.yes_count} sí · {option.no_count} no
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-violet-500"
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
        Se actualiza cada {POLL_INTERVAL_MS / 1000} segundos.
      </p>
    </section>
  );
}
