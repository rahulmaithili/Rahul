const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "with"
]);

export function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ");
}

export function extractKeywords(topic: string, limit = 5): string[] {
  const tokens = normalizeTopic(topic)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));

  const uniqueTokens: string[] = [];

  for (const token of tokens) {
    if (!uniqueTokens.includes(token)) {
      uniqueTokens.push(token);
    }

    if (uniqueTokens.length >= limit) {
      break;
    }
  }

  return uniqueTokens;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/u).length;
}
