import { basename, resolve } from "node:path";

import type { RepoType, WorkspaceRepo } from "../types";
import { getCurrentBranch } from "../git/getCurrentBranch";
import { getDefaultBranch } from "../git/getDefaultBranch";
import { getRemote } from "../git/getRemote";
import { getStatus, type GitStatus } from "../git/getStatus";
import { detectRepoMetadata, type RepoMetadata } from "./detectRepoMetadata";
import { findGitRepos } from "./findGitRepos";

export interface ScannedRepo {
  name: string;
  path: string;
  remote: string | null;
  defaultBranch: string;
  currentBranch: string | null;
  status: GitStatus;
  metadata: RepoMetadata;
}

export interface WorkspaceScan {
  root: string;
  repos: ScannedRepo[];
  workspaceRepos: Record<string, WorkspaceRepo>;
}

export async function scanWorkspace(root: string): Promise<WorkspaceScan> {
  const repoPaths = await findGitRepos(root);
  const scannedRepos = await Promise.all(
    repoPaths.map(async (repoPath) => {
      const remote = await getRemote(repoPath);

      return {
        path: repoPath,
        remote,
        defaultBranch: await getDefaultBranch(repoPath),
        currentBranch: await getCurrentBranch(repoPath),
        status: await getStatus(repoPath),
        metadata: detectRepoMetadata(repoPath),
      };
    }),
  );
  const nameCounts = new Map<string, number>();
  const repos = scannedRepos.map((repo) => {
    const baseName = repoName(repo.path, repo.remote);
    const count = nameCounts.get(baseName) ?? 0;
    nameCounts.set(baseName, count + 1);

    return {
      name: count === 0 ? baseName : `${baseName}-${count + 1}`,
      ...repo,
    };
  });

  return {
    root: resolve(root),
    repos,
    workspaceRepos: Object.fromEntries(
      repos.map((repo) => [repo.name, toWorkspaceRepo(repo)]),
    ),
  };
}

function toWorkspaceRepo(repo: ScannedRepo): WorkspaceRepo {
  const files = detectedFiles(repo.metadata);
  const integrations = repo.metadata.branchbrief.enabled
    ? { branchbrief: true }
    : undefined;

  return {
    path: repo.path,
    remote: repo.remote ?? undefined,
    default_base: repo.defaultBranch === "unknown" ? undefined : repo.defaultBranch,
    type: toWorkspaceRepoType(repo.metadata.type),
    package_manager: repo.metadata.packageManager,
    commands: repo.metadata.commands,
    files: Object.keys(files).length > 0 ? files : undefined,
    integrations,
  };
}

function detectedFiles(metadata: RepoMetadata): NonNullable<WorkspaceRepo["files"]> {
  const files: NonNullable<WorkspaceRepo["files"]> = {};

  if (metadata.docs.readme) {
    files.readme = "README.md";
  }

  if (metadata.agents.agentsMd) {
    files.agents = "AGENTS.md";
  } else if (metadata.agents.claudeMd) {
    files.agents = "CLAUDE.md";
  } else if (metadata.agents.copilotInstructions) {
    files.agents = ".github/copilot-instructions.md";
  }

  if (metadata.branchbrief.brief) {
    files.branchbrief = "BRANCH_BRIEF.md";
  }

  return files;
}

function toWorkspaceRepoType(type: RepoMetadata["type"]): RepoType {
  switch (type) {
    case "product/web-app":
    case "cloudflare-deployable":
      return "product";
    default:
      return type;
  }
}

function repoName(repoPath: string, remote: string | null): string {
  const fromRemote = remote ? repoNameFromRemote(remote) : null;
  return sanitizeRepoName(fromRemote ?? basename(repoPath));
}

function repoNameFromRemote(remote: string): string | null {
  const trimmed = remote.trim().replace(/\/$/, "");

  try {
    const url = new URL(trimmed);
    return basename(url.pathname).replace(/\.git$/, "") || null;
  } catch {
    const match = /[:/]([^/:/]+?)(?:\.git)?$/.exec(trimmed);
    return match?.[1] ?? null;
  }
}

function sanitizeRepoName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9._-]+/g, "-") || "repo";
}
