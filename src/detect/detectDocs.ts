import { existsSync } from "node:fs";
import { join } from "node:path";

export interface DetectedDocs {
  readme: boolean;
  docsDirectory: boolean;
  astroConfig: boolean;
  contentDocs: boolean;
  wranglerConfig: boolean;
  paths: string[];
}

const ASTRO_CONFIGS = ["astro.config.js", "astro.config.mjs", "astro.config.ts"];

export function detectDocs(repoPath: string): DetectedDocs {
  const paths: string[] = [];
  const readme = recordIfExists(repoPath, "README.md", paths);
  const docsDirectory = recordIfExists(repoPath, "docs", paths);
  const astroConfigPath = ASTRO_CONFIGS.find((path) => existsSync(join(repoPath, path)));
  const astroConfig = Boolean(astroConfigPath);

  if (astroConfigPath) {
    paths.push(astroConfigPath);
  }

  const contentDocs = recordIfExists(repoPath, "src/content/docs", paths);
  const wranglerConfig = recordIfExists(repoPath, "wrangler.toml", paths);

  return {
    readme,
    docsDirectory,
    astroConfig,
    contentDocs,
    wranglerConfig,
    paths,
  };
}

function recordIfExists(repoPath: string, path: string, paths: string[]): boolean {
  if (!existsSync(join(repoPath, path))) {
    return false;
  }

  paths.push(path);
  return true;
}
