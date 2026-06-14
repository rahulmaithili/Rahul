#!/usr/bin/env node
import { Command } from "commander";
import { AppError } from "../core/errors.js";
import { createGenerateCommand } from "./commands/generate.js";
import { createPreviewCommand } from "./commands/preview.js";
import { createValidateCommand } from "./commands/validate.js";

const program = new Command();

program
  .name("content-automation")
  .description("Generate researched, SEO-aware content packages.")
  .version("0.1.0")
  .option("--env-file <path>", "Path to .env file", ".env")
  .option("--config <path>", "Path to JSON config file")
  .addCommand(createGenerateCommand())
  .addCommand(createPreviewCommand())
  .addCommand(createValidateCommand());

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof AppError) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.error(error);
  process.exitCode = 1;
});
