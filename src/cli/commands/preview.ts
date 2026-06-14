import { Command } from "commander";
import { AppError } from "../../core/errors.js";
import type { OutputFormat } from "../../core/types.js";
import { loadConfig } from "../../services/config/index.js";
import { createDefaultServices } from "../../services/index.js";
import type { ResearchNotes } from "../../services/research/index.js";
import type { SeoReport } from "../../services/seo/index.js";

interface PreviewOptions {
  config?: string;
  format?: OutputFormat;
  language?: string;
  audience?: string;
  tone?: string;
  targetKeyword?: string;
}

const outputFormats = new Set<OutputFormat>(["markdown", "json"]);

export function createPreviewCommand(): Command {
  return new Command("preview")
    .description("Preview research and SEO analysis for a topic.")
    .argument("[topic]", "Topic or keyword to preview")
    .option("-c, --config <path>", "Path to JSON config file")
    .option("-f, --format <markdown|json>", "Output format", "markdown")
    .option("--language <language>", "Target language")
    .option("--audience <audience>", "Target audience")
    .option("--tone <tone>", "Writing tone")
    .option("--target-keyword <keyword>", "Target keyword")
    .action(async (topic: string | undefined, options: PreviewOptions, command: Command) => {
      if (!topic?.trim()) {
        throw new AppError("MISSING_TOPIC", "Provide a topic argument.");
      }

      const format = options.format ?? "markdown";

      if (!outputFormats.has(format)) {
        throw new AppError("INVALID_FORMAT", "Output format must be markdown or json.");
      }

      const globals = command.optsWithGlobals() as { envFile?: string; config?: string };
      const config = await loadConfig({
        envPath: globals.envFile,
        configPath: options.config ?? globals.config
      });
      const services = createDefaultServices();
      const request = {
        topic: topic.trim(),
        language: options.language ?? config.language,
        audience: options.audience ?? config.audience,
        tone: options.tone ?? config.tone,
        targetKeyword: options.targetKeyword
      };
      const research = await services.research.research(request);
      const seoReport = services.seo.analyze(request);
      const preview = { topic: request.topic, research, seoReport };
      const output =
        format === "json" ? JSON.stringify(preview, null, 2) : renderPreviewMarkdown(preview);

      process.stdout.write(output);
    });
}

function renderPreviewMarkdown(preview: {
  topic: string;
  research: ResearchNotes;
  seoReport: SeoReport;
}): string {
  const sources = preview.research.sources
    .map((source) => `- [${source.title}](${source.url}) (${source.confidence})`)
    .join("\n");

  return [
    `# Research and SEO preview: ${preview.topic}`,
    "",
    "## Research",
    "",
    `Confidence: ${preview.research.confidence}`,
    "",
    preview.research.notes
      .flatMap((note) => note.keyPoints.map((point) => `- ${point}`))
      .join("\n"),
    "",
    "## Sources",
    "",
    sources,
    "",
    "## SEO",
    "",
    `- Title: ${preview.seoReport.title}`,
    `- Meta description: ${preview.seoReport.metaDescription}`,
    `- Score: ${preview.seoReport.score}/100`,
    `- Intent: ${preview.seoReport.searchIntent}`,
    "",
    "## Recommendations",
    "",
    ...preview.seoReport.headingRecommendations.map((recommendation) => `- ${recommendation}`)
  ].join("\n");
}
