import { createClient } from "@/lib/supabase/server";
import type { Poll } from "@/types/database";

export type PollWithWinnerLabel = Poll & { winner_label?: string | null };

export async function enrichPollsWithWinnerLabels(
  polls: Poll[]
): Promise<PollWithWinnerLabel[]> {
  const closedPolls = polls.filter(
    (poll) =>
      ["resultados", "cerrado"].includes(poll.status) &&
      poll.winner_option_ids &&
      poll.winner_option_ids.length > 0
  );

  if (closedPolls.length === 0) {
    return polls;
  }

  const winnerIds = [
    ...new Set(closedPolls.flatMap((poll) => poll.winner_option_ids ?? [])),
  ];

  const supabase = await createClient();
  const { data: options } = await supabase
    .from("poll_options")
    .select("id, text, sort_order")
    .in("id", winnerIds);

  const textById = new Map(
    (options ?? []).map((option) => [option.id, option.text])
  );

  return polls.map((poll) => {
    if (
      !poll.winner_option_ids?.length ||
      !["resultados", "cerrado"].includes(poll.status)
    ) {
      return poll;
    }

    if (poll.winner_option_ids.length > 1) {
      const labels = poll.winner_option_ids
        .map((id) => textById.get(id))
        .filter(Boolean);
      return {
        ...poll,
        winner_label: labels.length > 0 ? labels.join(" · ") : "Empate",
      };
    }

    return {
      ...poll,
      winner_label: textById.get(poll.winner_option_ids[0]) ?? null,
    };
  });
}

export type ParticipantPollRow = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  max_participants: number;
  time_limit_minutes: number | null;
  status: Poll["status"];
  share_token: string;
  created_at: string;
  started_at: string | null;
  closes_at: string | null;
  ballotage_option_ids: string[] | null;
  winner_option_ids: string[] | null;
  closed_at: string | null;
  winner_label: string | null;
};

export function participantPollRowToPoll(row: ParticipantPollRow): PollWithWinnerLabel {
  return {
    id: row.id,
    host_id: row.host_id,
    title: row.title,
    description: row.description,
    max_participants: row.max_participants,
    time_limit_minutes: row.time_limit_minutes,
    status: row.status,
    share_token: row.share_token,
    created_at: row.created_at,
    started_at: row.started_at,
    closes_at: row.closes_at,
    ballotage_option_ids: row.ballotage_option_ids,
    winner_option_ids: row.winner_option_ids,
    closed_at: row.closed_at,
    winner_label: row.winner_label,
  };
}
