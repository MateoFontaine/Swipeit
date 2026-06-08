"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PollStatus } from "@/types";
import type { Poll, PollOption } from "@/types/database";
import { getHostPoll } from "./queries";
import { getPollByShareToken } from "./public-queries";

export type ResultRankingEntry = {
  option_id: string;
  text: string;
  sort_order: number;
  yes_count: number;
  is_winner: boolean;
  yes_voters: string[];
};

export type PollResultsData = {
  round: 1 | 2;
  is_tie: boolean;
  winner_option_ids: string[];
  ranking: ResultRankingEntry[];
};

export type LiveParticipant = {
  id: string;
  nickname: string;
  joined_at: string;
  has_voted: boolean;
  votes: { option_id: string; value: boolean; round: number }[];
};

export type LivePartialCount = {
  option_id: string;
  text: string;
  sort_order: number;
  yes_count: number;
  no_count: number;
};

export type PollLiveStats = {
  status: PollStatus;
  participant_count: number;
  max_participants: number;
  voted_count: number;
  round: 1 | 2;
  participants: LiveParticipant[];
  partial_counts: LivePartialCount[];
};

export type CalculateResultsOutcome = {
  status: PollStatus;
  ballotage?: boolean;
  tied?: boolean;
  error?: string;
};

export async function calculateResults(
  pollId: string
): Promise<CalculateResultsOutcome> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("calculate_results", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("calculateResults error:", error);
    return { status: "votando", error: error.message };
  }

  const result = data as {
    status?: PollStatus;
    ballotage?: boolean;
    tied?: boolean;
    error?: string;
  };

  return {
    status: result.status ?? "votando",
    ballotage: result.status === "ballotage",
    tied: result.tied,
    error: result.error,
  };
}

export async function finalizePoll(pollId: string): Promise<PollStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("finalize_poll", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("finalizePoll error:", error);
    return "resultados";
  }

  const result = data as { status?: PollStatus; finalized?: boolean };

  return result.status ?? "cerrado";
}

export async function getPollResults(
  shareToken: string
): Promise<PollResultsData | null> {
  const poll = await getPollByShareToken(shareToken);

  if (!poll || !["resultados", "cerrado"].includes(poll.status)) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_poll_results", {
    p_poll_id: poll.id,
  });

  if (error || !data) {
    console.error("getPollResults error:", error);
    return null;
  }

  const raw = data as {
    round: number;
    is_tie: boolean;
    winner_option_ids: string[];
    ranking: ResultRankingEntry[];
  };

  return {
    round: raw.round === 2 ? 2 : 1,
    is_tie: raw.is_tie,
    winner_option_ids: raw.winner_option_ids ?? [],
    ranking: raw.ranking ?? [],
  };
}

export async function getBallotageOptions(
  pollId: string
): Promise<Pick<PollOption, "id" | "text" | "sort_order">[]> {
  const supabase = await createClient();

  const { data: poll } = await supabase
    .from("polls")
    .select("ballotage_option_ids")
    .eq("id", pollId)
    .maybeSingle<Pick<Poll, "ballotage_option_ids">>();

  if (!poll?.ballotage_option_ids?.length) {
    return [];
  }

  const { data: options } = await supabase
    .from("poll_options")
    .select("id, text, sort_order")
    .eq("poll_id", pollId)
    .in("id", poll.ballotage_option_ids)
    .order("sort_order", { ascending: true })
    .returns<Pick<PollOption, "id" | "text" | "sort_order">[]>();

  return options ?? [];
}

export type HostFinalizeResult =
  | { success: true; status: PollStatus }
  | { success: false; error: string };

export async function hostFinalizePoll(
  pollId: string
): Promise<HostFinalizeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tenés que iniciar sesión." };
  }

  const poll = await getHostPoll(pollId);

  if (!poll) {
    return { success: false, error: "No encontramos esa encuesta." };
  }

  if (!["ballotage", "votando"].includes(poll.status)) {
    return {
      success: false,
      error: "Solo podés finalizar encuestas en votación o ballotage.",
    };
  }

  const outcome = await calculateResults(pollId);

  if (outcome.error) {
    return { success: false, error: "No pudimos calcular los resultados." };
  }

  revalidatePath(`/poll/${poll.share_token}`);
  revalidatePath(`/poll/${poll.share_token}/vote`);
  revalidatePath(`/dashboard/${pollId}`);
  revalidatePath("/dashboard");

  return { success: true, status: outcome.status };
}

export async function getPollLiveStats(
  pollId: string
): Promise<PollLiveStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_poll_live_stats", {
    p_poll_id: pollId,
  });

  if (error || !data) {
    console.error("getPollLiveStats error:", error);
    return null;
  }

  return data as PollLiveStats;
}

