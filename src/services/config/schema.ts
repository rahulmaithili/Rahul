import { z } from "zod";

export const providerEnvVarNames = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  serpapi: "SERPAPI_API_KEY",
  brave: "BRAVE_SEARCH_API_KEY",
  tavily: "TAVILY_API_KEY"
} as const;

export const providerSettingsSchema = z
  .object({
    enabled: z.boolean().optional(),
    apiKey: z.string().optional(),
    baseUrl: z.string().url().optional()
  })
  .default({});

export const providerConfigSchema = z
  .object({
    openai: providerSettingsSchema,
    anthropic: providerSettingsSchema,
    gemini: providerSettingsSchema,
    serpapi: providerSettingsSchema,
    brave: providerSettingsSchema,
    tavily: providerSettingsSchema
  })
  .default({
    openai: {},
    anthropic: {},
    gemini: {},
    serpapi: {},
    brave: {},
    tavily: {}
  });

export const researchConfigSchema = z
  .object({
    maxSources: z.number().int().min(1).max(50).default(5),
    includeQuotes: z.boolean().default(true)
  })
  .default({});

export const seoConfigSchema = z
  .object({
    minTitleLength: z.number().int().min(20).max(80).default(35),
    maxTitleLength: z.number().int().min(20).max(80).default(60),
    metaDescriptionMin: z.number().int().min(80).max(200).default(120),
    metaDescriptionMax: z.number().int().min(80).max(220).default(155)
  })
  .default({});

export const appConfigSchema = z
  .object({
    env: z.enum(["development", "test", "production"]).default("development"),
    outputDir: z.string().min(1).default("output"),
    language: z.string().min(2).default("en"),
    tone: z.string().min(1).default("professional"),
    audience: z.string().optional(),
    research: researchConfigSchema,
    seo: seoConfigSchema,
    providers: providerConfigSchema
  })
  .default({});

export type AppConfig = z.infer<typeof appConfigSchema>;
export type ProviderName = keyof typeof providerEnvVarNames;
export type ProviderConfig = z.infer<typeof providerConfigSchema>;
export type ResearchConfig = z.infer<typeof researchConfigSchema>;
export type SeoConfig = z.infer<typeof seoConfigSchema>;
