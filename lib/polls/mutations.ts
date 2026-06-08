import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Poll } from "@/types/database";
import {
  validateCreatePollInput,
  type CreatePollInput,
  type FieldErrors,
} from "./validation";

export type CreatePollResult =
  | { success: true; pollId: string; shareToken: string }
  | { success: false; error: string; fieldErrors?: FieldErrors };

export type StartPollResult =
  | { success: true }
  | { success: false; error: string };

export async function createPoll(
  input: CreatePollInput
): Promise<CreatePollResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Tenés que iniciar sesión para crear una encuesta.",
      };
    }

    const validation = validateCreatePollInput(input);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        fieldErrors: validation.fieldErrors,
      };
    }

    const { data } = validation;

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        host_id: user.id,
        title: data.title,
        description: data.description ?? null,
        max_participants: data.maxParticipants,
        time_limit_minutes: data.timeLimitMinutes,
        status: "esperando",
      })
      .select("id, share_token")
      .single();

    if (pollError || !poll) {
      console.error("createPoll insert error:", pollError);
      return {
        success: false,
        error:
          pollError?.message ??
          "No pudimos crear la encuesta. Intentá de nuevo.",
      };
    }

    const optionsToInsert = data.options.map((text, index) => ({
      poll_id: poll.id,
      text,
      sort_order: index,
    }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionsToInsert);

    if (optionsError) {
      console.error("createPoll options error:", optionsError);
      await supabase.from("polls").delete().eq("id", poll.id);
      return {
        success: false,
        error:
          optionsError.message ??
          "No pudimos guardar las opciones. Intentá de nuevo.",
      };
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      pollId: poll.id,
      shareToken: poll.share_token,
    };
  } catch (error) {
    console.error("createPoll unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    };
  }
}

export async function startPoll(pollId: string): Promise<StartPollResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Tenés que iniciar sesión." };
    }

    const { data: poll, error: fetchError } = await supabase
      .from("polls")
      .select("id, status, time_limit_minutes, host_id")
      .eq("id", pollId)
      .maybeSingle<
        Pick<Poll, "id" | "status" | "time_limit_minutes" | "host_id">
      >();

    if (fetchError || !poll) {
      return { success: false, error: "No encontramos esa encuesta." };
    }

    if (poll.host_id !== user.id) {
      return {
        success: false,
        error: "Solo el host puede iniciar la votación.",
      };
    }

    if (poll.status !== "esperando") {
      return {
        success: false,
        error: "Esta encuesta ya fue iniciada o está cerrada.",
      };
    }

    const startedAt = new Date();
    const closesAt = poll.time_limit_minutes
      ? new Date(startedAt.getTime() + poll.time_limit_minutes * 60 * 1000)
      : null;

    const { error: updateError } = await supabase
      .from("polls")
      .update({
        status: "votando",
        started_at: startedAt.toISOString(),
        closes_at: closesAt?.toISOString() ?? null,
      })
      .eq("id", pollId);

    if (updateError) {
      return {
        success: false,
        error: "No pudimos iniciar la votación. Intentá de nuevo.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${pollId}`);

    return { success: true };
  } catch (error) {
    console.error("startPoll unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    };
  }
}
