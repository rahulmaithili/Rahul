import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { AppError } from "../../core/errors.js";
import { appConfigSchema, providerEnvVarNames, type AppConfig, type ProviderName } from "./schema.js";

export interface LoadConfigOptions {
  cwd?: string;
  envPath?: string;
  configPath?: string;
}

type JsonRecord = Record<string, unknown>;

export function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

export function parseInteger(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function loadConfig(options: LoadConfigOptions = {}): Promise<AppConfig> {
  const cwd = options.cwd ?? process.cwd();
  const envPath = options.envPath ?? ".env";
  const parsedEnv = dotenv.config({ path: path.resolve(cwd, envPath) }).parsed ?? {};
  const env = { ...process.env, ...parsedEnv };
  const fileConfig = options.configPath
    ? await readJsonConfig(path.resolve(cwd, options.configPath))
    : {};
  const config = buildConfigFromEnvAndFile(env, fileConfig);

  return appConfigSchema.parse(config);
}

export function buildConfigFromEnvAndFile(
  env: NodeJS.ProcessEnv,
  fileConfig: JsonRecord = {}
): JsonRecord {
  const providers = buildProviderConfig(env, fileConfig.providers);

  return {
    ...fileConfig,
    env: nonEmpty(env.CONTENT_ENV) ?? fileConfig.env,
    outputDir: nonEmpty(env.CONTENT_OUTPUT_DIR) ?? fileConfig.outputDir,
    language: nonEmpty(env.CONTENT_LANGUAGE) ?? fileConfig.language,
    tone: nonEmpty(env.CONTENT_TONE) ?? fileConfig.tone,
    audience: nonEmpty(env.CONTENT_AUDIENCE) ?? fileConfig.audience,
    research: {
      ...(isObject(fileConfig.research) ? fileConfig.research : {}),
      maxSources:
        parseInteger(env.CONTENT_RESEARCH_MAX_SOURCES) ??
        (isObject(fileConfig.research) ? fileConfig.research.maxSources : undefined),
      includeQuotes:
        parseBoolean(env.CONTENT_RESEARCH_INCLUDE_QUOTES) ??
        (isObject(fileConfig.research) ? fileConfig.research.includeQuotes : undefined)
    },
    seo: {
      ...(isObject(fileConfig.seo) ? fileConfig.seo : {}),
      minTitleLength:
        parseInteger(env.CONTENT_SEO_MIN_TITLE_LENGTH) ??
        (isObject(fileConfig.seo) ? fileConfig.seo.minTitleLength : undefined),
      maxTitleLength:
        parseInteger(env.CONTENT_SEO_MAX_TITLE_LENGTH) ??
        (isObject(fileConfig.seo) ? fileConfig.seo.maxTitleLength : undefined),
      metaDescriptionMin:
        parseInteger(env.CONTENT_SEO_MIN_META_LENGTH) ??
        (isObject(fileConfig.seo) ? fileConfig.seo.metaDescriptionMin : undefined),
      metaDescriptionMax:
        parseInteger(env.CONTENT_SEO_MAX_META_LENGTH) ??
        (isObject(fileConfig.seo) ? fileConfig.seo.metaDescriptionMax : undefined)
    },
    providers
  };
}

async function readJsonConfig(configPath: string): Promise<JsonRecord> {
  try {
    const rawConfig = await readFile(configPath, "utf8");
    const parsed = JSON.parse(rawConfig) as unknown;

    if (!isObject(parsed)) {
      throw new AppError("INVALID_CONFIG", "Config file must contain a JSON object.");
    }

    return parsed;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("CONFIG_READ_FAILED", `Unable to read config file: ${configPath}`, error);
  }
}

function buildProviderConfig(env: NodeJS.ProcessEnv, fileProviders: unknown): JsonRecord {
  const providers: JsonRecord = {};
  const providerNames = Object.keys(providerEnvVarNames) as ProviderName[];

  for (const providerName of providerNames) {
    const fileProvider = isObject(fileProviders) ? fileProviders[providerName] : undefined;
    const envApiKey = nonEmpty(env[providerEnvVarNames[providerName]]);
    const fileApiKey = isObject(fileProvider) ? nonEmpty(fileProvider.apiKey) : undefined;
    const fileEnabled = isObject(fileProvider) ? fileProvider.enabled : undefined;
    const enabledFromEnv = parseBoolean(env[`CONTENT_${providerName.toUpperCase()}_ENABLED`]);

    providers[providerName] = {
      ...(isObject(fileProvider) ? fileProvider : {}),
      apiKey: envApiKey ?? fileApiKey,
      enabled: enabledFromEnv ?? (typeof fileEnabled === "boolean" ? fileEnabled : undefined)
    };
  }

  return providers;
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function isObject(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
