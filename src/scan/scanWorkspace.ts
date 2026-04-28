import { findGitRepos } from "./findGitRepos";
import { getCurrentBranch } from "../git/getCurrentBranch";
import { getDefaultBranch } from "../git/getDefaultBranch";
import { getRemote } from "../git/getRemote";
import { getStatus, type GitStatus } from "../git/getStatus";

export interface ScannedRepo {
  path: string;
  remote: string | null;
  defaultBranch: string;
  currentBranch: string | null;
  status: GitStatus;
}

export interface WorkspaceScan {
  root: string;
  repos: ScannedRepo[];
}

export async function scanWorkspace(root: string): Promise<WorkspaceScan> {
  const repoPaths = await findGitRepos(root);
  const repos = await Promise.all(
    repoPaths.map(async (repoPath) => ({
      path: repoPath,
      remote: await getRemote(repoPath),
      defaultBranch: await getDefaultBranch(repoPath),
      currentBranch: await getCurrentBranch(repoPath),
      status: await getStatus(repoPath),
    })),
  );

  return {
    root,
    repos,
  };
}
