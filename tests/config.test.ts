import { describe, expect, it } from "vitest";
import { buildConfigFromEnvAndFile, loadConfig, parseBoolean, parseInteger } from "../src/services/config/index.js";

describe("config loader", () => {
  it("parses boolean environment values", () => {
    expect(parseBoolean("true")).toBe(true);
    expect(parseBoolean("1")).toBe(true);
    expect(parseBoolean("yes")).toBe(true);
    expect(parseBoolean("on")).toBe(true);
    expect(parseBoolean("0")).toBe(false);
    expect(parseBoolean("false")).toBe(false);
    expect(parseBoolean("no")).toBe(false);
    expect(parseBoolean("off")).toBe(false);
    expect(parseBoolean("maybe")).toBeUndefined();
  });

  it("parses integer environment values", () => {
    expect(parseInteger("42")).toBe(42);
    expect(parseInteger("0")).toBe(0);
    expect(parseInteger("abc")).toBeUndefined();
    expect(parseInteger("")).toBeUndefined();
    expect(parseInteger(null)).toBeUndefined();
  });

  it("merges environment configuration over JSON config values", () => {
    const config = buildConfigFromEnvAndFile(
      {
        CONTENT_LANGUAGE: "hi",
        CONTENT_OUTPUT_DIR: "exports",
        CONTENT_RESEARCH_MAX_SOURCES: "3",
        CONTENT_SEO_MIN_TITLE_LENGTH: "40",
        OPENAI_API_KEY: "env-key",
        CONTENT_OPENAI_ENABLED: "true"
      },
      {
        language: "en",
        outputDir: "output",
        research: { maxSources: 5 },
        seo: { minTitleLength: 35 },
        providers: {
          openai: {
            enabled: false,
            apiKey: "file-key"
          }
        }
      }
    ) as Awaited<ReturnType<typeof loadConfig>>;

    expect(config.language).toBe("hi");
    expect(config.outputDir).toBe("exports");
    expect(config.research.maxSources).toBe(3);
    expect(config.seo.minTitleLength).toBe(40);
    expect(config.providers.openai.apiKey).toBe("env-key");
    expect(config.providers.openai.enabled).toBe(true);
  });

  it("returns file config values when env not provided", () => {
    const config = buildConfigFromEnvAndFile({}, {
      language: "fr",
      tone: "casual",
      audience: "everyone"
    }) as Awaited<ReturnType<typeof loadConfig>>;

    expect(config.language).toBe("fr");
    expect(config.tone).toBe("casual");
    expect(config.audience).toBe("everyone");
  });
});
