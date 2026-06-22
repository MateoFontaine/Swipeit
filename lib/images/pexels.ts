const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";
const REQUEST_TIMEOUT_MS = 5000;

type PexelsSearchResponse = {
  photos?: Array<{
    src?: {
      large?: string;
    };
  }>;
};

export async function searchPexelsImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const url = new URL(PEXELS_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "portrait");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("Pexels API error:", response.status);
      return null;
    }

    const data = (await response.json()) as PexelsSearchResponse;
    return data.photos?.[0]?.src?.large ?? null;
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) {
      console.error("Pexels fetch error:", error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
