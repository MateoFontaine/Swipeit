"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PollStatus } from "@/types";
import type { Participant, Poll, PollOption } from "@/types/database";
import {
  getPollByShareToken,
  getPollOptionsByShareToken,
} from "./public-queries";
import {
  mapVoteError,
  validateVoteInputs,
  type VoteInput,
} from "./vote-validation";

export type SubmitVotesResult =
  | { success: true; pollClosed: boolean; pollStatus: PollStatus }
  | { success: false; error: string };

export type ParticipantProgress = {
  hasVoted: boolean;
  votedOptionIds: string[];
  requiredCount: number;
};

export type PollClosureResult = {
  closed: boolean;
  status: PollStatus | null;
  reason?: string;
};

function voteRoundForStatus(status: PollStatus): 1 | 2 {
  return status === "ballotage" ? 2 : 1;
}

async function getRequiredOptionIds(
  shareToken: string
): Promise<Pick<PollOption, "id">[]> {
  const options = await getPollOptionsByShareToken(shareToken);
  return options.map((o) => ({ id: o.id }));
}

export async function getParticipantProgress(
  participantId: string,
  pollId: string,
  shareToken: string
): Promise<ParticipantProgress> {
  const supabase = await createClient();

  const poll = await getPollByShareToken(shareToken);

  if (!poll || poll.id !== pollId) {
    return { hasVoted: false, votedOptionIds: [], requiredCount: 0 };
  }

  const round = voteRoundForStatus(poll.status);
  const options = await getRequiredOptionIds(shareToken);
  const requiredCount = options.length;

  const { data: existingVotes } = await supabase
    .from("votes")
    .select("option_id")
    .eq("participant_id", participantId)
    .eq("poll_id", pollId)
    .eq("round", round);

  const votedOptionIds = (existingVotes ?? []).map((v) => v.option_id);

  return {
    hasVoted: requiredCount > 0 && votedOptionIds.length >= requiredCount,
    votedOptionIds,
    requiredCount,
  };
}

export async function checkPollClosure(
  pollId: string
): Promise<PollClosureResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_and_close_poll", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("checkPollClosure error:", error);
    return { closed: false, status: null };
  }

  const result = data as {
    closed?: boolean;
    status?: PollStatus;
    reason?: string;
    ballotage?: boolean;
  };

  if (result.closed || result.status === "ballotage" || result.status === "resultados") {
    const poll = await supabase
      .from("polls")
      .select("share_token")
      .eq("id", pollId)
      .maybeSingle<Pick<Poll, "share_token">>();

    if (poll.data?.share_token) {
      revalidatePath(`/poll/${poll.data.share_token}`);
      revalidatePath(`/poll/${poll.data.share_token}/vote`);
    }
    revalidatePath("/dashboard");
  }

  return {
    closed: result.closed ?? false,
    status: result.status ?? null,
    reason: result.reason,
  };
}

export async function submitVotes(
  participantId: string,
  pollId: string,
  shareToken: string,
  votes: VoteInput[]
): Promise<SubmitVotesResult> {
  try {
    const supabase = await createClient();

    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id, poll_id, user_id")
      .eq("id", participantId)
      .eq("poll_id", pollId)
      .maybeSingle<Pick<Participant, "id" | "poll_id" | "user_id">>();

    if (participantError || !participant) {
      return {
        success: false,
        error: "No encontramos tu participación en esta encuesta.",
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (participant.user_id && participant.user_id !== user?.id) {
      return {
        success: false,
        error: "No tenés permiso para votar con esta participación.",
      };
    }

    const poll = await getPollByShareToken(shareToken);

    if (!poll || poll.id !== pollId) {
      return { success: false, error: "No encontramos esa encuesta." };
    }

    if (!["votando", "ballotage"].includes(poll.status)) {
      return {
        success: false,
        error: "Esta encuesta ya no acepta votos.",
      };
    }

    if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
      await checkPollClosure(pollId);
      return {
        success: false,
        error: "El tiempo de votación terminó.",
      };
    }

    const round = voteRoundForStatus(poll.status);
    const options = await getRequiredOptionIds(shareToken);
    const requiredOptionIds = options.map((o) => o.id);

    if (requiredOptionIds.length === 0) {
      return {
        success: false,
        error: "Esta encuesta no tiene opciones para votar.",
      };
    }

    const validation = validateVoteInputs(votes, requiredOptionIds);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const progress = await getParticipantProgress(
      participantId,
      pollId,
      shareToken
    );
    if (progress.hasVoted) {
      return {
        success: false,
        error: "Ya enviaste tus votos. No se pueden modificar.",
      };
    }

    const rows = votes.map((vote) => ({
      poll_id: pollId,
      participant_id: participantId,
      option_id: vote.optionId,
      value: vote.value === "yes",
      round,
    }));

    const { error: insertError } = await supabase.from("votes").insert(rows);

    if (insertError) {
      console.error("submitVotes insert error:", insertError);
      return {
        success: false,
        error: mapVoteError(
          insertError.message ?? "No pudimos guardar tus votos. Intentá de nuevo."
        ),
      };
    }

    const closure = await checkPollClosure(pollId);

    if (poll.share_token) {
      revalidatePath(`/poll/${poll.share_token}`);
      revalidatePath(`/poll/${poll.share_token}/vote`);
    }

    return {
      success: true,
      pollClosed: closure.closed || closure.status === "resultados",
      pollStatus: closure.status ?? poll.status,
    };
  } catch (error) {
    console.error("submitVotes unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    };
  }
}

export async function checkPollClosureByToken(
  shareToken: string
): Promise<PollClosureResult> {
  const poll = await getPollByShareToken(shareToken);
  if (!poll) {
    return { closed: false, status: null };
  }
  return checkPollClosure(poll.id);
}
