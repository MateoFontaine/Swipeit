import { createClient } from "@/lib/supabase/server";
import type { Poll } from "@/types/database";
import {
  enrichPollsWithWinnerLabels,
  participantPollRowToPoll,
  type ParticipantPollRow,
  type PollWithWinnerLabel,
} from "./winner-labels";

export async function getHostPolls(): Promise<PollWithWinnerLabel[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  return enrichPollsWithWinnerLabels(polls ?? []);
}

export async function getParticipantPolls(): Promise<PollWithWinnerLabel[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_participant_polls");

  if (error) {
    console.error("getParticipantPolls error:", error);
    return [];
  }

  return ((data as ParticipantPollRow[] | null) ?? []).map(
    participantPollRowToPoll
  );
}

export async function getParticipantPoll(
  pollId: string
): Promise<Poll | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_participant_poll", {
    p_poll_id: pollId,
  });

  if (error || !data) {
    return null;
  }

  return data as Poll;
}

export async function getHostPoll(pollId: string): Promise<Poll | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .eq("host_id", user.id)
    .maybeSingle<Poll>();

  return poll;
}
