export type OutputFormat = "markdown" | "json";
export type ContentLength = "short" | "medium" | "long";

export interface TopicInput {
  topic: string;
  language?: string;
  audience?: string;
  tone?: string;
  targetKeyword?: string;
  length?: ContentLength;
}

export interface ServiceContext {
  config: unknown;
}
