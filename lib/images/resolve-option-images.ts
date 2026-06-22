import { extractImageQuery } from "./keyword";
import { searchPexelsImage } from "./pexels";

export async function resolveOptionImageUrl(text: string): Promise<string | null> {
  const query = extractImageQuery(text);
  if (!query) {
    return null;
  }

  return searchPexelsImage(query);
}

export async function resolveOptionImageUrls(
  texts: string[]
): Promise<(string | null)[]> {
  return Promise.all(texts.map(resolveOptionImageUrl));
}
