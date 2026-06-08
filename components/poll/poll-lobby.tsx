"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JoinPollForm } from "@/components/poll/join-poll-form";
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
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (poll.status === "cerrado" || poll.status === "resultados") {
    return null;
  }

  if (participant) {
    if (poll.status === "esperando") {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-4xl text-center" aria-hidden="true">
            ⏳
          </p>
          <p className="mt-3 text-center font-semibold text-amber-900">
            ¡Ya estás adentro, {participant.nickname}!
          </p>
          <p className="mt-2 text-center text-sm text-amber-800 leading-relaxed">
            Ya estás en la sala de espera. El host va a iniciar la votación
            cuando se unan todos. Esta página se actualiza sola.
          </p>
          <p className="mt-3 text-center text-xs text-amber-700">
            {participantCount}{" "}
            {participantCount === 1 ? "participante" : "participantes"} en la
            sala
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Redirigiendo a votar…</p>
      </div>
    );
  }

  if (!canJoinNew && joinBlock) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center">
        <p className="font-semibold">{joinBlock.title}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {joinBlock.message}
        </p>
        {isFull && (
          <p className="mt-3 text-xs text-muted-foreground">
            Capacidad: {participantCount} / {poll.max_participants}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/6">
      <h2 className="text-lg font-semibold">Unite a la encuesta</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Elegí un nickname para participar. No hace falta crear cuenta.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {participantCount} de {poll.max_participants} participantes
      </p>
      <div className="mt-5">
        <JoinPollForm
          shareToken={shareToken}
          pollId={poll.id}
          suggestedNickname={suggestedNickname}
          onJoined={handleJoined}
        />
      </div>
    </div>
  );
}
