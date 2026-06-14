import type { ContentPackage } from "../content/types.js";

export interface OutputRenderer {
  renderMarkdown(contentPackage: ContentPackage): string;
  renderJson(contentPackage: ContentPackage, pretty?: boolean): string;
}
