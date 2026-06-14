import type { ResearchSource } from "../types.js";

export interface FetchResult {
  url: string;
  title: string;
  snippet: string;
  content: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchProvider {
  name: string;
  search(query: string, options?: { maxResults?: number }): Promise<SearchResult[]>;
}

export interface FetchProvider {
  name: string;
  fetch(url: string): Promise<FetchResult>;
}

export interface ResearchProviderContext {
  maxSources: number;
  includeQuotes: boolean;
  audience?: string;
  language?: string;
}

export interface SourceProvider {
  name: string;
  discover(request: {
    topic: string;
    keywords: string[];
    context: ResearchProviderContext;
  }): Promise<ResearchSource[]>;
}
