const STOP_WORDS = new Set([
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "de",
  "del",
  "al",
  "a",
  "en",
  "con",
  "por",
  "para",
  "y",
  "o",
  "qué",
  "que",
  "cuál",
  "cual",
  "cómo",
  "como",
]);

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/^[^a-z0-9áéíóúüñ]+|[^a-z0-9áéíóúüñ]+$/gi, "");
}

export function extractImageQuery(text: string): string | null {
  const words = text
    .trim()
    .split(/[\s,.;:!?¿¡]+/)
    .map(normalizeWord)
    .filter(
      (word) =>
        word.length > 0 &&
        !STOP_WORDS.has(word) &&
        !/^\d+$/.test(word)
    );

  if (words.length === 0) {
    return null;
  }

  return words.slice(0, 2).join(" ");
}
