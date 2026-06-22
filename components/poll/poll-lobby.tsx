"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JoinPollForm } from "@/components/poll/join-poll-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getStoredParticipantId,
  storeParticipantId,
} from "@/lib/polls/participant-storage";
import type { Poll, PollStatus } from "@/types";

type PollLobbyProps = {
  poll: Poll;
  shareToken: string;
  participantCount: number;
  suggestedNickname?: string;
  accountParticipant?: { id: string; nickname: string } | null;
};

type LobbyParticipant = {
  id: string;
  nickname: string;
};

const ACTIVE_VOTE_STATUSES: PollStatus[] = ["votando", "ballotage"];

function LobbySkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando…">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full max-w-xs" />
      <Skeleton className="mb-1 h-4 w-12" />
      <Skeleton className="h-14 rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

function getJoinBlockReason(
  status: PollStatus,
  isFull: boolean
): { title: string; message: string } | null {
  if (isFull) {
    return {
      title: "Encuesta llena",
      message:
        "Se alcanzó el máximo de participantes. No se pueden sumar más personas.",
    };
  }

  if (status === "votando") {
    return {
      title: "La votación ya comenzó",
      message:
        "Solo pueden votar quienes se unieron antes de que el host iniciara. Si ya participaste, abrí el link desde el mismo dispositivo.",
    };
  }

  if (status === "ballotage") {
    return {
      title: "Ballotage en curso",
      message:
        "Si ya participaste, abrí el link desde el mismo dispositivo donde votaste. Si no participaste antes, pedile al organizador que te comparta el link cuando empiece una nueva ronda.",
    };
  }

  if (status === "resultados" || status === "cerrado") {
    return {
      title: "Encuesta finalizada",
      message: "Esta encuesta ya terminó y no acepta nuevos participantes.",
    };
  }

  return null;
}

export function PollLobby({
  poll,
  shareToken,
  participantCount,
  suggestedNickname,
  accountParticipant,
}: PollLobbyProps) {
  const router = useRouter();
  const [participant, setParticipant] = useState<LobbyParticipant | null>(
    accountParticipant ?? null
  );
  const [checking, setChecking] = useState(!accountParticipant);
  const isFull = participantCount >= poll.max_participants;
  const canJoinNew = poll.status === "esperando" && !isFull;
  const joinBlock = !participant ? getJoinBlockReason(poll.status, isFull) : null;

  useEffect(() => {
    if (accountParticipant) {
      storeParticipantId(poll.id, accountParticipant.id);
      setChecking(false);
      return;
    }

    const storedId = getStoredParticipantId(poll.id);
    if (!storedId) {
      setChecking(false);
      return;
    }

    async function verifyStored() {
      try {
        const params = new URLSearchParams({
          pollId: poll.id,
          participantId: storedId!,
        });
        const response = await fetch(`/api/polls/participant?${params}`);
        const data = await response.json();

        if (data.valid) {
          setParticipant({
            id: data.participantId,
            nickname: data.nickname,
          });
        }
      } finally {
        setChecking(false);
      }
    }

    verifyStored();
  }, [accountParticipant, poll.id]);

  useEffect(() => {
    if (!participant) return;
    if (ACTIVE_VOTE_STATUSES.includes(poll.status)) {
      router.replace(`/poll/${shareToken}/vote`);
    }
  }, [participant, poll.status, router, shareToken]);

  useEffect(() => {
    if (!participant || poll.status !== "esperando") return;

    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [participant, poll.status, router]);

  function handleJoined(participantId: string, nickname: string) {
    setParticipant({ id: participantId, nickname });
    if (ACTIVE_VOTE_STATUSES.includes(poll.status)) {
      router.push(`/poll/${shareToken}/vote`);
    }
  }

  if (checking) {
    return <LobbySkeleton />;
  }

  if (poll.status === "cerrado" || poll.status === "resultados") {
    return null;
  }

  if (participant) {
    if (poll.status === "esperando") {
      return (
        <section className="rounded-xl border border-violet-200/60 bg-violet-500/[0.04] px-5 py-6 text-center sm:px-6">
          <p className="text-sm font-medium text-violet-600">Sala de espera</p>
          <p className="mt-2 text-lg font-semibold tracking-tight">
            ¡Ya estás adentro, {participant.nickname}!
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            El host va a iniciar la votación cuando se unan todos. Esta página
            se actualiza sola.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {participantCount}{" "}
            {participantCount === 1 ? "participante" : "participantes"} en la
            sala
          </p>
        </section>
      );
    }

    return (
      <section className="flex flex-col gap-3 py-2" aria-busy="true">
        <p className="text-center text-sm text-muted-foreground">
          Redirigiendo a votar…
        </p>
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </section>
    );
  }

  if (!canJoinNew && joinBlock) {
    return (
      <section className="rounded-xl border border-border/60 bg-muted/30 px-5 py-6 text-center sm:px-6">
        <p className="font-semibold tracking-tight">{joinBlock.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {joinBlock.message}
        </p>
        {isFull && (
          <p className="mt-4 text-xs text-muted-foreground">
            Capacidad: {participantCount} / {poll.max_participants}
          </p>
        )}
      </section>
    );
  }

  return (
    <section>
      <p className="text-sm font-medium text-violet-600">Participar</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">
        Unite a la encuesta
      </h2>
      <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Elegí un nickname. No hace falta crear cuenta.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {participantCount} de {poll.max_participants} participantes
      </p>
      <div className="mt-6">
        <JoinPollForm
          shareToken={shareToken}
          pollId={poll.id}
          suggestedNickname={suggestedNickname}
          onJoined={handleJoined}
        />
      </div>
    </section>
  );
}
