import type { ResearchSource } from "../types.js";

export function deduplicateSources(sources: ResearchSource[]): ResearchSource[] {
  const seen = new Set<string>();
  const unique: ResearchSource[] = [];

  for (const source of sources) {
    const normalized = source.url.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(source);
    }
  }

  return unique;
}
