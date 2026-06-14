import { TemplateContentGenerator } from "./content/index.js";
import { DeterministicResearchService } from "./research/index.js";
import { DeterministicSeoService } from "./seo/index.js";
import { MarkdownOutputRenderer } from "./output/index.js";

export function createDefaultServices() {
  return {
    research: new DeterministicResearchService(),
    seo: new DeterministicSeoService(),
    content: new TemplateContentGenerator(),
    output: new MarkdownOutputRenderer()
  };
}
