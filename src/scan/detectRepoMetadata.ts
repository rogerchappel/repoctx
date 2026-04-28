import {
  detectAgentInstructions,
  type DetectedAgentInstructions,
} from "../detect/detectAgentInstructions.js";
import { detectBranchbrief, type DetectedBranchbrief } from "../detect/detectBranchbrief.js";
import { detectCommands, type DetectedCommands } from "../detect/detectCommands.js";
import { detectDocs, type DetectedDocs } from "../detect/detectDocs.js";
import { detectPackageManager, type PackageManager } from "../detect/detectPackageManager.js";
import { detectProjectType, type ProjectType } from "../detect/detectProjectType.js";

export interface RepoMetadata {
  packageManager: PackageManager;
  commands: DetectedCommands;
  type: ProjectType;
  docs: DetectedDocs;
  agents: DetectedAgentInstructions;
  branchbrief: DetectedBranchbrief;
}

export function detectRepoMetadata(repoPath: string): RepoMetadata {
  const packageManager = detectPackageManager(repoPath);

  return {
    packageManager,
    commands: detectCommands(repoPath, packageManager),
    type: detectProjectType(repoPath),
    docs: detectDocs(repoPath),
    agents: detectAgentInstructions(repoPath),
    branchbrief: detectBranchbrief(repoPath),
  };
}
