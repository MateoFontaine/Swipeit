"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SwipeDirection } from "@/components/poll/swipe-card";
import { SwipeStack } from "@/components/poll/swipe-stack";
import { VoteDone } from "@/components/poll/vote-done";
import { Skeleton } from "@/components/ui/skeleton";
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

type VotePhase = "checking" | "swipe" | "submitting" | "done" | "error";

function VoteLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando…">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mx-auto aspect-[3/4] w-full max-w-[400px] rounded-3xl" />
      <div className="flex justify-center gap-8">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}

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
            setPhase(progress.hasVoted ? "done" : "swipe");
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
          setPhase(progress.hasVoted ? "done" : "swipe");
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
        setPhase("done");
        return;
      }

      setError(result.error);
      setPhase("error");
    },
    [participantId, pollId, shareToken]
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
    return <VoteLoadingSkeleton />;
  }

  if (phase === "done" && nickname) {
    return <VoteDone nickname={nickname} />;
  }

  if (phase === "submitting") {
    return (
      <div
        role="status"
        className="rounded-xl border border-violet-200/60 bg-violet-500/[0.04] px-5 py-8 text-center"
        aria-busy="true"
      >
        <p className="text-sm font-medium text-violet-600">Enviando</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          Guardando tus votos…
        </h2>
        <Skeleton className="mx-auto mt-4 h-1.5 w-24 rounded-full" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200/80 bg-red-50/80 px-5 py-6 text-center"
      >
        <p className="font-semibold text-red-900">
          No pudimos guardar tus votos
        </p>
        <p className="mt-2 text-sm leading-relaxed text-red-700">{error}</p>
        {pendingVotes && (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        {isBallotage ? "Segunda vuelta" : "Votando"} como{" "}
        <span className="font-semibold text-violet-600">{nickname}</span>
      </p>
      <SwipeStack options={options} onComplete={handleComplete} />
    </div>
  );
}
