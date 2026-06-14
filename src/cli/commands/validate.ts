import { Command } from "commander";
import { AppError } from "../../core/errors.js";
import { loadConfig } from "../../services/config/index.js";

interface ValidateOptions {
  config?: string;
}

export function createValidateCommand(): Command {
  return new Command("validate")
    .description("Validate config and required topic inputs.")
    .argument("[topic]", "Optional topic or keyword to validate")
    .option("-c, --config <path>", "Path to JSON config file")
    .action(async (topic: string | undefined, options: ValidateOptions, command: Command) => {
      const globals = command.optsWithGlobals() as { envFile?: string; config?: string };
      const config = await loadConfig({
        envPath: globals.envFile,
        configPath: options.config ?? globals.config
      });
      const topicValue = topic?.trim();

      if (!topicValue) {
        throw new AppError("MISSING_TOPIC", "Provide a topic argument to validate.");
      }

      process.stdout.write(
        JSON.stringify(
          {
            ok: true,
            topic: topicValue,
            config: {
              env: config.env,
              language: config.language,
              tone: config.tone,
              outputDir: config.outputDir,
              research: config.research,
              seo: config.seo,
              providers: Object.fromEntries(
                Object.entries(config.providers).map(([name, provider]) => [
                  name,
                  {
                    configured: Boolean(provider.apiKey),
                    enabled: Boolean(provider.enabled),
                    hasBaseUrl: Boolean(provider.baseUrl)
                  }
                ])
              )
            }
          },
          null,
          2
        )
      );
    });
}
