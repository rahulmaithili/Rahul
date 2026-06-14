import { describe, expect, it } from "vitest";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execAsync = promisify(exec);

describe("CLI:generate command", () => {
  const CLI_PATH = path.resolve(import.meta.dirname, "../dist/cli/index.js");
  const FIXTURES_PATH = path.resolve(import.meta.dirname, "../fixtures/sample-config.json");

  it("generates markdown output with topic", async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} generate "sustainable gardening" --config ${FIXTURES_PATH}`);

    expect(stdout).toContain("#");
    expect(stdout).toContain("## Sources");
    expect(stdout).toContain("## SEO Metadata");
    expect(stdout).toContain("## JSON-LD Schema");
    expect(stdout).toContain("sustainable gardening");
  });

  it("generates JSON output with --format json", async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} generate "test topic" --config ${FIXTURES_PATH} -f json`);

    const parsed = JSON.parse(stdout);
    expect(parsed.topic).toBe("test topic");
    expect(parsed.slug).toBeTruthy();
    expect(parsed.seoBrief).toBeTruthy();
    expect(parsed.citations).toBeInstanceOf(Array);
  });

  it("writes output to file with --out option", async () => {
    const outputPath = "/tmp/test-output.md";
    
    const { stdout } = await execAsync(`node ${CLI_PATH} generate "test output" --config ${FIXTURES_PATH} -o ${outputPath}`);
    expect(stdout).toBe("");

    const { readFile } = await import("node:fs/promises");
    const content = await readFile(outputPath, "utf8");
    expect(content).toContain("#");
    expect(content).toContain("test output");
  });

  it("fails without topic argument", async () => {
    const { stderr, stdout } = await execAsync(`node ${CLI_PATH} generate`).catch((e: { stderr?: string; stdout?: string }) => e);
    
    expect(stderr || stdout).toContain("Provide a topic argument");
  });

  it("fails with invalid format", async () => {
    const { stderr, stdout } = await execAsync(`node ${CLI_PATH} generate "test" --config ${FIXTURES_PATH} -f invalid`).catch((e: { stderr?: string; stdout?: string }) => e);

    expect(stderr || stdout).toContain("Output format must be markdown or json");
  });
});

describe("CLI:preview command", () => {
  const CLI_PATH = path.resolve(import.meta.dirname, "../dist/cli/index.js");
  const FIXTURES_PATH = path.resolve(import.meta.dirname, "../fixtures/sample-config.json");

  it("previews research and SEO for topic", async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} preview "sustainable gardening" --config ${FIXTURES_PATH}`);

    expect(stdout).toContain("Research");
    expect(stdout).toContain("Sources");
    expect(stdout).toContain("SEO");
  });

  it("outputs JSON preview with --format json", async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} preview "test topic" --config ${FIXTURES_PATH} -f json`);

    const parsed = JSON.parse(stdout);
    expect(parsed.topic).toBe("test topic");
    expect(parsed.research).toBeTruthy();
    expect(parsed.seoReport).toBeTruthy();
  });
});

describe("CLI:validate command", () => {
  const CLI_PATH = path.resolve(import.meta.dirname, "../dist/cli/index.js");
  const FIXTURES_PATH = path.resolve(import.meta.dirname, "../fixtures/sample-config.json");

  it("validates config and topic", async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} validate "test topic" --config ${FIXTURES_PATH}`);

    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.topic).toBe("test topic");
    expect(parsed.config).toBeTruthy();
  });

  it("shows provider configuration status", async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} validate "test" --config ${FIXTURES_PATH}`);

    const parsed = JSON.parse(stdout);
    expect(parsed.config.providers).toBeTruthy();
    expect(parsed.config.providers.openai).toBeTruthy();
    expect(parsed.config.providers.openai.configured).toBe(false);
  });

  it("fails without topic argument", async () => {
    const { stderr, stdout } = await execAsync(`node ${CLI_PATH} validate`).catch((e: { stderr?: string; stdout?: string }) => e);

    expect(stderr || stdout).toContain("Provide a topic argument to validate");
  });
});