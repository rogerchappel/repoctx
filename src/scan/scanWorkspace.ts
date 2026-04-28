import { findGitRepos } from "./findGitRepos";
import { getCurrentBranch } from "../git/getCurrentBranch";
import { getDefaultBranch } from "../git/getDefaultBranch";
import { getRemote, inferRepoName } from "../git/getRemote";
import { getStatus, type GitStatus } from "../git/getStatus";

export interface ScannedRepo {
  name: string;
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
    repoPaths.map(async (repoPath) => {
      const remote = await getRemote(repoPath);

      return {
        name: inferRepoName(repoPath, remote),
        path: repoPath,
        remote,
        defaultBranch: await getDefaultBranch(repoPath),
        currentBranch: await getCurrentBranch(repoPath),
        status: await getStatus(repoPath),
      };
    }),
  );

  return {
    root,
    repos,
  };
}
