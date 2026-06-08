import { createClient } from "@/lib/supabase/server";
import type { Poll } from "@/types/database";

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
