# Content Automation Tool

A Node.js **TypeScript CLI** for automated content research, SEO analysis, content package generation, and output rendering. Ye tool content research, SEO optimization, article drafting, aur output formatting ko automate karta hai — bina manually research kiye.

## How It Works

```
topic (input)
  -> Research (sources + key points)
  -> SEO analysis (title, meta, score, intent)
  -> Content package (outline + draft body + JSON-LD)
  -> Output (markdown or JSON)
```

Har step deterministic/local default mein chalta hai. Agar aapke paas real LLM ya search API keys hain, toh aap config mein enable kar sakte hain — lekin tool **bina API key ke bhi perfectly** kaam karta hai (mock/deterministic data se).



## Installation

```bash
git clone <your-repo-url>
cd automated-content-research-and-seo-tool
npm install
```

### Prerequisites

- Node.js >= 20
- npm (bundled with Node)

### Build

```bash
npm run build
```

Ye `dist/` folder banayega jisme compiled JavaScript aayega.

```bash
npm run typecheck   # Type errors check karo
npm run lint        # Code style check
npm test            # Tests run karo
```

## Configuration

### Environment Variables (`.env`)

Project root mein `.env` file banayein. Aap `.env.example` copy kar sakte hain:

```bash
cp .env.example .env
```

#### Required / Optional Keys

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Optional | — | OpenAI LLM key (enable via `CONTENT_OPENAI_ENABLED=true`) |
| `ANTHROPIC_API_KEY` | Optional | — | Anthropic/Claude key |
| `GEMINI_API_KEY` | Optional | — | Google Gemini key |
| `SERPAPI_API_KEY` | Optional | — | SerpAPI search key |
| `BRAVE_SEARCH_API_KEY` | Optional | — | Brave Search key |
| `TAVILY_API_KEY` | Optional | — | Tavily search key |
| `CONTENT_ENV` | Optional | `development` | Environment: `development` \| `test` \| `production` |
| `CONTENT_OUTPUT_DIR` | Optional | `output` | Default output directory |
| `CONTENT_LANGUAGE` | Optional | `en` | Default language |
| `CONTENT_TONE` | Optional | `professional` | Default writing tone |
| `CONTENT_AUDIENCE` | Optional | — | Default target audience |
| `CONTENT_RESEARCH_MAX_SOURCES` | Optional | `5` | Max research sources (1–50) |
| `CONTENT_RESEARCH_INCLUDE_QUOTES` | Optional | — | Include quotes in research (true/false) |
| `CONTENT_SEO_MIN_TITLE_LENGTH` | Optional | `35` | Min SEO title length |
| `CONTENT_SEO_MAX_TITLE_LENGTH` | Optional | `60` | Max SEO title length |
| `CONTENT_SEO_MIN_META_LENGTH` | Optional | `120` | Min meta description length |
| `CONTENT_SEO_MAX_META_LENGTH` | Optional | `155` | Max meta description length |

**Note:** Saari API keys **optional** hain. Agar unset hain, tool pure deterministic/local data use karta hai — koi external call nahi hota.

> Hindi/Hinglish speakers: Provider slots ready hain lekin abhi deterministic fallback active hai. Jab real providers add honge, `.env` mein keys daal kar `CONTENT_OPENAI_ENABLED=true` jaise flags se enable kar denge.

### Config File (`sample-config.json`)

Aap optional JSON config file bhi pass kar sakte hain:

```json
{
  "language": "en",
  "tone": "professional",
  "audience": "beginners",
  "outputDir": "output",
  "research": {
    "maxSources": 5,
    "includeQuotes": true
  },
  "seo": {
    "minTitleLength": 35,
    "maxTitleLength": 60,
    "metaDescriptionMin": 120,
    "metaDescriptionMax": 155
  },
  "providers": {
    "openai": { "enabled": false },
    "anthropic": { "enabled": false },
    "gemini": { "enabled": false },
    "serpapi": { "enabled": false },
    "brave": { "enabled": false },
    "tavily": { "enabled": false }
  }
}
```

Config precedence: **CLI flags > JSON config > `.env` > defaults**

## CLI Commands

Binary name: `content-automation`

Global flags:
- `--env-file <path>` — .env file path (default: `.env`)
- `--config <path>` — JSON config file path

### `generate`

Full content package generate karta hai (research + SEO + article + citations + JSON-LD).

```bash
content-automation generate "content automation tools" --language en --tone professional --format markdown --out output/article.md
```

#### Options

| Flag | Short | Description |
|---|---|---|
| `--config <path>` | `-c` | JSON config file |
| `--out <path>` | `-o` | Output file (directory auto-create hota hai) |
| `--format <fmt>` | `-f` | `markdown` (default) \| `json` |
| `--language <lang>` | | Target language |
| `--audience <aud>` | | Target audience |
| `--tone <tone>` | | Writing tone |
| `--target-keyword <kw>` | | Override target keyword |
| `--length <len>` | | `short` \| `medium` (default) \| `long` |

### `preview`

Sirf research + SEO analysis run karta hai. Content generation nahi.

```bash
content-automation preview "AI content writing" --format json
```

Same flags as `generate` except `--out` aur `--length` nahi hain.

### `validate`

Config validate karta hai aur provider status dikhata hai.

```bash
content-automation validate "machine learning basics"
```

No extra flags except `--config`.

## Example Usage

### 1. Quick Generate (stdout)

```bash
npm run build
npx content-automation generate "best SEO practices 2025" --language en --tone friendly --format markdown
```

Output terminal par print hoga.

### 2. Generate to File (JSON)

```bash
npx content-automation generate \
  "AI content automation" \
  --format json \
  --out output/ai-content.md
```

`output/` folder auto bana lega.

### 3. Preview Before Generating

```bash
npx content-automation preview "email marketing tips" --format markdown
```

Dekh ke manzoor ho, phir `generate` use karo.

### 4. Validate Config

```bash
npx content-automation validate "product management" --config my-config.json
```

### 5. Development Mode (tsx, bina build)

```bash
npm run dev -- generate "react performance optimization" --format markdown
```

## Output Formats

### Markdown (default)

```markdown
# Best SEO Practices 2025: A Complete Guide

**Slug:** best-seo-practices-2025
**Target keyword:** best SEO practices 2025
**SEO score:** 82/100

## Introduction

Content automation ... [draft body continues]

## SEO Metadata
- Meta title: Best SEO Practices 2025: A Complete Guide for...
- Meta description: Discover the best SEO practices in 2025...
- Search intent: informational
- Keywords: SEO, best SEO practices, search engine optimization, content strategy, organic traffic

## JSON-LD Schema
```json
{ "@context": "https://schema.org", "@type": "Article", ... }
```
```

### JSON

Full `ContentPackage` object — research, SEO report, outline, draft body, citations sab kuch.

```json
{
  "topic": "best SEO practices 2025",
  "slug": "best-seo-practices-2025",
  "seoBrief": { ... },
  "outline": [ ... ],
  "draftBody": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "faqs": [ ... ],
  "schemaJsonLd": "{ ... }",
  "citations": [ ... ],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

## Provider Notes

### Current State — Deterministic / Offline-First

Abhi sab services deterministic/local hain:

- **Research:** `https://example.com/research/<keyword>` placeholder sources generate karta hai (confidence 0.55). No real web search.
- **SEO:** Pure algorithm — no external API calls. Title, meta, heading recommendations, JSON-LD sab locally ban jata hai.
- **Content:** Template-based draft body. H2 sections, subheadings, citations, FAQ, schema — sab structured format mein.
- **Output:** Local markdown/JSON rendering.

### Adding Real Providers (Next Steps)

Agar real search ya LLM providers connect karna hai:

1. `.env` mein API key add karein:
   ```bash
   SERPAPI_API_KEY=your-key
   OPENAI_API_KEY=your-key
   ```
2. Config mein enabled karein:
   ```env
   CONTENT_SERPAPI_ENABLED=true
   CONTENT_OPENAI_ENABLED=true
   ```
3. `src/services/` mein naye `*Service` class likhein jo existing interfaces (`ResearchService`, `SeoService`, `ContentGenerationService`) implement karein.
4. `createDefaultServices()` mein swap kar dein:
   ```ts
   research: new SerpApiResearchService()
   content: new OpenAIContentGenerator()
   ```
5. CLI flags ya config file se provider selection bhi add kar sakte hain.

Search providers: **SerpAPI, Brave Search, Tavily**  
LLM providers: **OpenAI, Anthropic (Claude), Google Gemini**

## Testing

```bash
npm test
```

Ye **Vitest** use karta hai. 9 test files cover karte hain CLI, config, core, output, research, SEO, content, services.

> Note: CLI tests `dist/cli/index.js` pe depend karte hain, isliye pehle `npm run build` chalao.

```bash
npm run test:watch   # Development mode mein watch
```

## Project Structure

```
src/
├── cli/
│   ├── index.ts              # Entry point (Commander setup)
│   └── commands/
│       ├── generate.ts       # Full pipeline
│       ├── preview.ts        # Research + SEO only
│       └── validate.ts       # Config validation
├── core/
│   ├── errors.ts             # Custom error classes
│   ├── slug.ts               # Slug generation
│   ├── text.ts               # Text utilities (truncate, countWords)
│   └── types.ts              # OutputFormat etc.
├── services/
│   ├── index.ts              # createDefaultServices() orchestrator
│   ├── config/
│   │   ├── loader.ts         # .env + JSON loading, dotenv
│   │   └── schema.ts         # Zod validation schema
│   ├── research/
│   │   ├── service.ts        # DeterministicResearchService
│   │   └── types.ts          # ResearchService interface
│   ├── seo/
│   │   ├── service.ts        # DeterministicSeoService
│   │   └── types.ts          # SeoService interface
│   ├── content/
│   │   ├── service.ts        # TemplateContentGenerator
│   │   ├── prompts.ts        # Prompt templates (for future LLM use)
│   │   └── types.ts          # ContentPackage, ContentGenerationService
│   └── output/
│       ├── service.ts        # Markdown + JSON renderer
│       └── types.ts          # ContentPackageRenderer
tests/                         # Vitest tests (same structure)
fixtures/
├── sample-config.json
├── sample-output.json
└── sample-output.md
```

## Quick Reference

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Build | `npm run build` |
| Run (dev) | `npm run dev -- generate "topic"` |
| Run (prod) | `npx content-automation generate "topic"` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Test | `npm test` |

## Next Steps (Practical)

1. **Real search integration:** Abhi deterministic source placeholders use ho rahe hain. SerpAPI ya Tavily adapter likh kar real search results le sakte hain.
2. **LLM content generation:** Template-based draft ko replace kar ke OpenAI/Anthropic/Gemini ka adapter add karo. `prompts.ts` mein templates already ready hain.
3. **Multi-language support:** `--language hi` ya `--language en-hi` pass kar ke Hinglish content generate karo.
4. **Batch mode:** `--input topics.txt --output-dir ./articles` jaise flags add karke multiple topics ek saath process karo.
5. **CI/CD:** GitHub Action bana ke scheduled content generation automate karo.

---

Built with TypeScript, Commander, Zod, dotenv, Vitest. ESM-only project targeting Node >= 20.
