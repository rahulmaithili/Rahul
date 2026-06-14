import type { ResearchNotes } from "../research/types.js";
import type { SeoReport } from "../seo/types.js";
import type { TopicInput } from "../../core/types.js";

export interface SeoBrief {
  targetKeyword: string;
  keywords: string[];
  searchIntent: SeoReport["searchIntent"];
  title: string;
  metaDescription: string;
  score: number;
}

export interface ArticleOutlineSection {
  heading: string;
  subheadings: string[];
}

export interface ContentCitation {
  id: string;
  title: string;
  url: string;
  note: string;
}

export interface ContentPackage {
  topic: string;
  slug: string;
  seoBrief: SeoBrief;
  outline: ArticleOutlineSection[];
  draftBody: string;
  metaTitle: string;
  metaDescription: string;
  faqs: string[];
  schemaJsonLd: string;
  citations: ContentCitation[];
  createdAt: string;
}

export interface ContentGenerationRequest {
  topicInput: TopicInput;
  research: ResearchNotes;
  seoReport: SeoReport;
}

export interface ContentGenerationService {
  generatePackage(request: ContentGenerationRequest): Promise<ContentPackage>;
}
