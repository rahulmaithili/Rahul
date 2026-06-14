export { DeterministicResearchService } from "./service.js";
export { ManualSourceProvider } from "./providers/manual.js";
export { deduplicateSources, rankSources, buildNote, summarize } from "./resolvers/index.js";
export type {
  ResearchProviderContext,
  SourceProvider,
  SearchProvider
} from "./providers/types.js";
export type {
  ResearchNote,
  ResearchNotes,
  ResearchQuote,
  ResearchRequest,
  ResearchService
} from "./types.js";
