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

    if (poll.status === "votando") {
      return {
        success: false,
        error:
          "La votación ya comenzó. Solo pueden votar quienes se unieron antes.",
      };
    }

    if (poll.status !== "esperando") {
      return {
        success: false,
        error:
          poll.status === "ballotage"
            ? "La encuesta está en ballotage. Si ya participaste, abrí el link desde el mismo dispositivo."
            : "Esta encuesta ya terminó y no acepta nuevos participantes.",
      };
    }

    const supabase = await createClient();
    const { data: currentCount, error: countError } = await supabase.rpc(
      "get_participant_count",
      { p_poll_id: poll.id }
    );

    if (countError) {
      console.error("joinPoll count error:", countError);
      return {
        success: false,
        error: "No pudimos verificar la capacidad. Intentá de nuevo.",
      };
    }

    if ((currentCount as number) >= poll.max_participants) {
      return {
        success: false,
        error: `Se alcanzó el máximo de ${poll.max_participants} participantes.`,
      };
    }

    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

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

export type LinkParticipantResult =
  | {
      success: true;
      participantId: string;
      nickname: string;
      linked?: boolean;
      reconnected?: boolean;
      message?: string;
    }
  | { success: false; error: string };

export async function linkParticipantToAccount(
  participantId: string
): Promise<LinkParticipantResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Tenés que iniciar sesión para vincular tu cuenta.",
      };
    }

    const { data, error } = await supabase.rpc("link_participant_to_user", {
      p_participant_id: participantId,
    });

    if (error) {
      console.error("linkParticipantToAccount error:", error);
      return {
        success: false,
        error: "No pudimos vincular tu cuenta. Intentá de nuevo.",
      };
    }

    const result = data as {
      success?: boolean;
      error?: string;
      participant_id?: string;
      nickname?: string;
      linked?: boolean;
      reconnected?: boolean;
      message?: string;
    };

    if (!result.success || !result.participant_id || !result.nickname) {
      return {
        success: false,
        error: result.error ?? "No pudimos vincular tu cuenta.",
      };
    }

    return {
      success: true,
      participantId: result.participant_id,
      nickname: result.nickname,
      linked: result.linked,
      reconnected: result.reconnected,
      message: result.message,
    };
  } catch (error) {
    console.error("linkParticipantToAccount unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    };
  }
}
