import type { TopicInput } from "../../core/types.js";

export type SearchIntent =
  | "informational"
  | "commercial"
  | "navigational"
  | "transactional"
  | "unknown";

export interface SeoKeyword {
  keyword: string;
  score: number;
  intent?: SearchIntent;
}

export interface SeoCheck {
  id: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

export interface SeoReport {
  targetKeyword: string;
  keywords: SeoKeyword[];
  searchIntent: SearchIntent;
  title: string;
  metaDescription: string;
  outlineScore: number;
  readabilityScore: number;
  headingRecommendations: string[];
  internalLinkSuggestions: string[];
  faqSuggestions: string[];
  schemaSuggestions: string[];
  score: number;
  checks: SeoCheck[];
}

export type SeoRequest = TopicInput;

export interface SeoService {
  analyze(request: SeoRequest): SeoReport;
}
