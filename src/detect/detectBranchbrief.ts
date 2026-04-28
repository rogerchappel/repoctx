import { existsSync } from "node:fs";
import { join } from "node:path";

export interface DetectedBranchbrief {
  workflow: boolean;
  brief: boolean;
  enabled: boolean;
  paths: string[];
}

export function detectBranchbrief(repoPath: string): DetectedBranchbrief {
  const paths: string[] = [];
  const workflow = recordIfExists(repoPath, ".github/workflows/branchbrief.yml", paths);
  const brief = recordIfExists(repoPath, "BRANCH_BRIEF.md", paths);

  return {
    workflow,
    brief,
    enabled: workflow || brief,
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
