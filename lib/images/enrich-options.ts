import { resolveOptionImageUrl } from "@/lib/images/resolve-option-images";
import { createClient } from "@/lib/supabase/server";
import type { PollOption } from "@/types/database";

export async function enrichPollOptionsWithImages(
  pollOptions: PollOption[],
  config?: { persist?: boolean }
): Promise<PollOption[]> {
  const persist = config?.persist ?? false;

  const enriched = await Promise.all(
    pollOptions.map(async (option) => {
      if (option.image_url) {
        return option;
      }

      const imageUrl = await resolveOptionImageUrl(option.text);
      if (!imageUrl) {
        return option;
      }

      return { ...option, image_url: imageUrl };
    })
  );

  if (!persist) {
    return enriched;
  }

  const supabase = await createClient();
  await Promise.all(
    enriched.map(async (option, index) => {
      const original = pollOptions[index];
      if (original.image_url || !option.image_url) {
        return;
      }

      await supabase
        .from("poll_options")
        .update({ image_url: option.image_url })
        .eq("id", option.id);
    })
  );

  return enriched;
}
