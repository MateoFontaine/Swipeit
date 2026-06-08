"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SwipeDirection } from "@/components/poll/swipe-card";
import { SwipeStack } from "@/components/poll/swipe-stack";
import { VoteWaiting } from "@/components/poll/vote-waiting";
import {
  getStoredParticipantId,
  storeParticipantId,
} from "@/lib/polls/participant-storage";
import {
  getParticipantProgress,
  submitVotes,
} from "@/lib/polls/vote-actions";
import type { VoteInput } from "@/lib/polls/vote-validation";
import { createClient } from "@/lib/supabase/client";
import type { PollOption } from "@/types/database";

type VoteInterfaceProps = {
  pollId: string;
  shareToken: string;
  options: PollOption[];
  isBallotage?: boolean;
};

type VotePhase = "checking" | "swipe" | "submitting" | "waiting" | "error";

export function VoteInterface({
  pollId,
  shareToken,
  options,
  isBallotage = false,
}: VoteInterfaceProps) {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [phase, setPhase] = useState<VotePhase>("checking");
  const [error, setError] = useState<string | null>(null);
  const [pendingVotes, setPendingVotes] = useState<Record<
    string,
    SwipeDirection
  > | null>(null);

  useEffect(() => {
    async function resolveParticipant() {
      const storedId = getStoredParticipantId(pollId);

      if (storedId) {
        try {
          const params = new URLSearchParams({
            pollId,
            participantId: storedId,
          });
          const response = await fetch(`/api/polls/participant?${params}`);
          const data = await response.json();
          if (data.valid) {
            setParticipantId(data.participantId);
            setNickname(data.nickname);
            const progress = await getParticipantProgress(
              data.participantId,
              pollId,
              shareToken
            );
            setPhase(progress.hasVoted ? "waiting" : "swipe");
            return;
          }
        } catch {
          // fall through to account lookup
        }
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: participant } = await supabase
          .from("participants")
          .select("id, nickname")
          .eq("poll_id", pollId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (participant) {
          storeParticipantId(pollId, participant.id);
          setParticipantId(participant.id);
          setNickname(participant.nickname);
          const progress = await getParticipantProgress(
            participant.id,
            pollId,
            shareToken
          );
          setPhase(progress.hasVoted ? "waiting" : "swipe");
          return;
        }
      }

      router.replace(`/poll/${shareToken}`);
    }

    resolveParticipant();
  }, [pollId, router, shareToken]);

  const sendVotes = useCallback(
    async (votes: Record<string, SwipeDirection>) => {
      if (!participantId) return;

      setPhase("submitting");
      setError(null);

      const voteInputs: VoteInput[] = Object.entries(votes).map(
        ([optionId, value]) => ({ optionId, value })
      );

      const result = await submitVotes(
        participantId,
        pollId,
        shareToken,
        voteInputs
      );

      if (result.success) {
        setPhase("waiting");
        if (result.pollClosed) {
          router.refresh();
        }
        return;
      }

      setError(result.error);
      setPhase("error");
    },
    [participantId, pollId, shareToken, router]
  );

  const handleComplete = useCallback(
    (votes: Record<string, SwipeDirection>) => {
      setPendingVotes(votes);
      sendVotes(votes);
    },
    [sendVotes]
  );

  const handleRetry = useCallback(() => {
    if (pendingVotes) {
      sendVotes(pendingVotes);
    }
  }, [pendingVotes, sendVotes]);

  if (phase === "checking") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (phase === "waiting" && nickname) {
    return <VoteWaiting nickname={nickname} shareToken={shareToken} />;
  }

  if (phase === "submitting") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-4xl" aria-hidden="true">
          ✓
        </p>
        <h2 className="mt-3 text-lg font-semibold text-emerald-900">
          ¡Listo! Enviando votos…
        </h2>
        <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
          Guardando tus respuestas. Un momento…
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-lg font-semibold text-rose-900">
          No pudimos guardar tus votos
        </p>
        <p className="mt-2 text-sm text-rose-800 leading-relaxed">{error}</p>
        {pendingVotes && (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {isBallotage ? "Ballotage" : "Votando"} como{" "}
        <span className="font-semibold text-foreground">{nickname}</span>
      </p>
      <SwipeStack options={options} onComplete={handleComplete} />
    </div>
  );
}
