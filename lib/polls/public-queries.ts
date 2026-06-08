import { createClient } from "@/lib/supabase/server";
import type { Participant, Poll, PollOption } from "@/types/database";

export async function getPollByShareToken(
  shareToken: string
): Promise<Poll | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_poll_by_share_token", {
    p_token: shareToken,
  });

  if (error || !data) {
    return null;
  }

  return data as Poll;
}

export async function getParticipantCount(pollId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_participant_count", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("getParticipantCount error:", error);
    return 0;
  }

  return (data as number) ?? 0;
}

export async function getParticipantByUserId(
  pollId: string,
  userId: string
): Promise<Participant | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("participants")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle<Participant>();

  return data;
}

export async function getPollOptionsByShareToken(
  shareToken: string
): Promise<PollOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_poll_options_by_share_token",
    { p_token: shareToken }
  );

  if (error || !data) {
    return [];
  }

  return data as PollOption[];
}

export async function getParticipantById(
  pollId: string,
  participantId: string
): Promise<Participant | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("participants")
    .select("*")
    .eq("poll_id", pollId)
    .eq("id", participantId)
    .maybeSingle<Participant>();

  return data;
}
