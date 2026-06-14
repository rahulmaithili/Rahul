import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { AppError } from "../../core/errors.js";
import type { ContentLength, OutputFormat } from "../../core/types.js";
import { loadConfig } from "../../services/config/index.js";
import { createDefaultServices } from "../../services/index.js";

interface GenerateOptions {
  config?: string;
  out?: string;
  format?: OutputFormat;
  language?: string;
  audience?: string;
  tone?: string;
  targetKeyword?: string;
  length?: ContentLength;
}

const outputFormats = new Set<OutputFormat>(["markdown", "json"]);

export function createGenerateCommand(): Command {
  return new Command("generate")
    .description("Generate a complete content package from a topic.")
    .argument("[topic]", "Topic or keyword to research")
    .option("-c, --config <path>", "Path to JSON config file")
    .option("-o, --out <path>", "Output file path")
    .option("-f, --format <markdown|json>", "Output format", "markdown")
    .option("--language <language>", "Target language")
    .option("--audience <audience>", "Target audience")
    .option("--tone <tone>", "Writing tone")
    .option("--target-keyword <keyword>", "Target keyword")
    .option("--length <short|medium|long>", "Content length", "medium")
    .action(async (topic: string | undefined, options: GenerateOptions, command: Command) => {
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
        targetKeyword: options.targetKeyword,
        length: options.length
      };
      const research = await services.research.research(request);
      const seoReport = services.seo.analyze(request);
      const contentPackage = await services.content.generatePackage({
        topicInput: request,
        research,
        seoReport
      });
      const output =
        format === "json"
          ? services.output.renderJson(contentPackage)
          : services.output.renderMarkdown(contentPackage);

      if (options.out) {
        const outputPath = path.resolve(options.out);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, output, "utf8");
        return;
      }

      process.stdout.write(output);
    });
}
