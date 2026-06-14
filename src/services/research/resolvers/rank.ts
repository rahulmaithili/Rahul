import type { ResearchSource } from "../types.js";

export function rankSources(sources: ResearchSource[]): ResearchSource[] {
  return sources
    .slice()
    .sort((a, b) => {
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) {
        return confidenceDiff;
      }
      return a.title.localeCompare(b.title);
    });
}
