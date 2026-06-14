import type { TopicInput } from "../../core/types.js";

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  provider: "manual" | "web" | "search";
  retrievedAt: string;
  confidence: number;
}

export interface ResearchQuote {
  text: string;
  sourceId: string;
  pageRange?: string;
}

export interface ResearchNote {
  id: string;
  topic: string;
  keyPoints: string[];
  quotes: ResearchQuote[];
  sources: ResearchSource[];
  salience: number;
  confidence: number;
}

export interface ResearchNotes {
  topic: string;
  normalizedTopic: string;
  language?: string;
  audience?: string;
  notes: ResearchNote[];
  sources: ResearchSource[];
  confidence: number;
}

export type ResearchRequest = TopicInput;

export interface ResearchService {
  research(request: ResearchRequest): Promise<ResearchNotes>;
}
