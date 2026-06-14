import { describe, expect, it } from "vitest";
import { normalizeTopic, extractKeywords, truncate, countWords } from "../src/core/text.js";
import { slugify } from "../src/core/slug.js";
import { AppError } from "../src/core/errors.js";

describe("text utilities", () => {
  describe("normalizeTopic", () => {
    it("trims whitespace and lowercases", () => {
      expect(normalizeTopic("  HELLO World  ")).toBe("hello world");
    });

    it("removes special characters (preserves normalized spaces)", () => {
      expect(normalizeTopic("Hello! World?")).toBe("hello world ");
    });

    it("preserves unicode characters", () => {
      expect(normalizeTopic("café résumé")).toBe("café résumé");
    });
  });

  describe("extractKeywords", () => {
    it("extracts keywords from a topic", () => {
      const keywords = extractKeywords("How to build a sustainable garden");
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it("filters out stop words", () => {
      const keywords = extractKeywords("How to build a sustainable garden");
      expect(keywords).not.toContain("how");
      expect(keywords).not.toContain("to");
      expect(keywords).not.toContain("a");
    });

    it("respects limit parameter", () => {
      const keywords = extractKeywords("How to build a sustainable garden with organic vegetables", 3);
      expect(keywords.length).toBeLessThanOrEqual(3);
    });

    it("removes duplicates while preserving order", () => {
      const keywords = extractKeywords("garden garden garden sustainable sustainable");
      expect(keywords).toHaveLength(2);
      expect(keywords[0]).toBe("garden");
      expect(keywords[1]).toBe("sustainable");
    });
  });

  describe("truncate", () => {
    it("does not truncate text within limit", () => {
      expect(truncate("Hello world", 20)).toBe("Hello world");
    });

    it("truncates text exceeding limit with ellipsis", () => {
      const result = truncate("This is a very long text that needs truncation", 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain("…");
    });

    it("handles empty string", () => {
      expect(truncate("", 10)).toBe("");
    });
  });

  describe("countWords", () => {
    it("counts words correctly", () => {
      expect(countWords("Hello world")).toBe(2);
      expect(countWords("One two three four")).toBe(4);
    });

    it("handles empty string", () => {
      expect(countWords("")).toBe(0);
      expect(countWords("   ")).toBe(0);
    });
  });
});

describe("slug utilities", () => {
  it("converts to lowercase slug", () => {
    expect(slugify("SUSTAINABLE GARDEN")).toBe("sustainable-garden");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("!Hello World!")).toBe("hello-world");
  });

  it("handles unicode characters", () => {
    expect(slugify("café résumé")).toBe("cafe-resume");
  });

  it("returns fallback for empty input", () => {
    expect(slugify("")).toBe("topic");
    expect(slugify("!!!")).toBe("topic");
  });

  it("truncates long slugs", () => {
    const longInput = "a".repeat(100);
    const result = slugify(longInput);
    expect(result.length).toBeLessThanOrEqual(80);
  });
});

describe("AppError", () => {
  it("creates error with code and message", () => {
    const error = new AppError("TEST_CODE", "Test error message");
    expect(error.code).toBe("TEST_CODE");
    expect(error.message).toBe("Test error message");
    expect(error.name).toBe("AppError");
  });

  it("stores optional cause", () => {
    const cause = new Error("Original error");
    const error = new AppError("TEST_CODE", "Test error", cause);
    expect(error.cause).toBe(cause);
  });
});