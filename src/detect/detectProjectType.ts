import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ProjectType =
  | "docs-site"
  | "oss-cli"
  | "github-action"
  | "template"
  | "product/web-app"
  | "cloudflare-deployable"
  | "unknown";

export function detectProjectType(repoPath: string): ProjectType {
  if (
    hasAny(repoPath, ["astro.config.js", "astro.config.mjs", "astro.config.ts"]) &&
    hasPath(repoPath, "src/content/docs")
  ) {
    return "docs-site";
  }

  if (hasAny(repoPath, ["action.yml", "action.yaml"])) {
    return "github-action";
  }

  if (packageJsonHasBin(repoPath)) {
    return "oss-cli";
  }

  if (hasPath(repoPath, "templates") && hasPath(repoPath, "AGENTS.md")) {
    return "template";
  }

  if (hasAny(repoPath, ["next.config.js", "next.config.mjs", "next.config.ts"])) {
    return "product/web-app";
  }

  if (hasPath(repoPath, "wrangler.toml")) {
    return "cloudflare-deployable";
  }

  return "unknown";
}

function hasPath(repoPath: string, path: string): boolean {
  return existsSync(join(repoPath, path));
}

function hasAny(repoPath: string, paths: string[]): boolean {
  return paths.some((path) => hasPath(repoPath, path));
}

function packageJsonHasBin(repoPath: string): boolean {
  const packageJsonPath = join(repoPath, "package.json");

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { bin?: unknown };
    return (
      typeof packageJson.bin === "string" ||
      (typeof packageJson.bin === "object" && packageJson.bin !== null)
    );
  } catch {
    return false;
  }
}
