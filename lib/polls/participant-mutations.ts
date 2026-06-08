import { createClient } from "@/lib/supabase/server";
import type { Participant } from "@/types/database";
import { validateNickname } from "./participant-validation";
import {
  getParticipantByUserId,
  getPollByShareToken,
} from "./public-queries";

export type JoinPollResult =
  | {
      success: true;
      participantId: string;
      nickname: string;
      pollId: string;
      reconnected: boolean;
    }
  | { success: false; error: string };

function mapJoinError(message: string): string {
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "Ese nickname ya está en uso en esta encuesta.";
  }
  if (message.includes("máximo de participantes")) {
    return message;
  }
  if (message.includes("no acepta nuevos participantes")) {
    return "Esta encuesta ya no acepta nuevos participantes.";
  }
  if (message.includes("row-level security")) {
    return "No pudimos unirte por un problema de permisos. Si sos el host del proyecto, aplicá la migración fix_participants_rls en Supabase.";
  }
  return message;
}

export async function joinPoll(
  shareToken: string,
  nickname: string
): Promise<JoinPollResult> {
  try {
    const poll = await getPollByShareToken(shareToken);

    if (!poll) {
      return { success: false, error: "No encontramos esa encuesta." };
    }

    if (!["esperando", "votando"].includes(poll.status)) {
      return {
        success: false,
        error: "Esta encuesta ya no acepta nuevos participantes.",
      };
    }

    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const existing = await getParticipantByUserId(poll.id, user.id);
      if (existing) {
        return {
          success: true,
          participantId: existing.id,
          nickname: existing.nickname,
          pollId: poll.id,
          reconnected: true,
        };
      }
    }

    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        poll_id: poll.id,
        user_id: user?.id ?? null,
        nickname: validation.nickname,
      })
      .select("id, nickname")
      .single<Pick<Participant, "id" | "nickname">>();

    if (error || !participant) {
      console.error("joinPoll error:", error);
      return {
        success: false,
        error: mapJoinError(
          error?.message ?? "No pudimos unirte. Intentá de nuevo."
        ),
      };
    }

    return {
      success: true,
      participantId: participant.id,
      nickname: participant.nickname,
      pollId: poll.id,
      reconnected: false,
    };
  } catch (error) {
    console.error("joinPoll unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    };
  }
}
