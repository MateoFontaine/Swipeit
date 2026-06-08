"use server";

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tenés que iniciar sesión para crear una encuesta." };
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
    return {
      success: false,
      error: "No pudimos crear la encuesta. Intentá de nuevo.",
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
    await supabase.from("polls").delete().eq("id", poll.id);
    return {
      success: false,
      error: "No pudimos guardar las opciones. Intentá de nuevo.",
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    pollId: poll.id,
    shareToken: poll.share_token,
  };
}

export async function startPoll(pollId: string): Promise<StartPollResult> {
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
    .maybeSingle<Pick<Poll, "id" | "status" | "time_limit_minutes" | "host_id">>();

  if (fetchError || !poll) {
    return { success: false, error: "No encontramos esa encuesta." };
  }

  if (poll.host_id !== user.id) {
    return { success: false, error: "Solo el host puede iniciar la votación." };
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
}

export async function getHostPolls(): Promise<Poll[]> {
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

  return polls ?? [];
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
