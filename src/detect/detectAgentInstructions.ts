import { existsSync } from "node:fs";
import { join } from "node:path";

export interface DetectedAgentInstructions {
  agentsMd: boolean;
  claudeMd: boolean;
  copilotInstructions: boolean;
  paths: string[];
}

export function detectAgentInstructions(repoPath: string): DetectedAgentInstructions {
  const paths: string[] = [];

  return {
    agentsMd: recordIfExists(repoPath, "AGENTS.md", paths),
    claudeMd: recordIfExists(repoPath, "CLAUDE.md", paths),
    copilotInstructions: recordIfExists(repoPath, ".github/copilot-instructions.md", paths),
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
