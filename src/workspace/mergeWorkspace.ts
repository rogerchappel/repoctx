import type {
  MergeWorkspaceOptions,
  Workspace,
  WorkspaceRepo,
} from "../types";
import { normalizeWorkspace } from "./schema";

export function mergeWorkspace(
  current: Workspace,
  discoveredRepos: Record<string, WorkspaceRepo>,
  options: MergeWorkspaceOptions = {},
): Workspace {
  const repos: Record<string, WorkspaceRepo> = options.removeMissing
    ? {}
    : { ...current.repos };

  for (const [name, discovered] of Object.entries(discoveredRepos)) {
    repos[name] = mergeRepo(current.repos[name], discovered);
  }

  return normalizeWorkspace({
    ...current,
    repos,
  });
}

function mergeRepo(
  existing: WorkspaceRepo | undefined,
  discovered: WorkspaceRepo,
): WorkspaceRepo {
  if (!existing) {
    return cloneRepo(discovered);
  }

  return {
    ...discovered,
    ...existing,
    commands: {
      ...discovered.commands,
      ...existing.commands,
    },
    files: {
      ...discovered.files,
      ...existing.files,
    },
    integrations: {
      ...discovered.integrations,
      ...existing.integrations,
    },
    risk: {
      ...discovered.risk,
      ...existing.risk,
    },
    agents: {
      ...discovered.agents,
      ...existing.agents,
    },
    tags: existing.tags ?? discovered.tags,
    notes: existing.notes ?? discovered.notes,
  };
}

function cloneRepo(repo: WorkspaceRepo): WorkspaceRepo {
  return {
    ...repo,
    commands: repo.commands ? { ...repo.commands } : undefined,
    files: repo.files ? { ...repo.files } : undefined,
    integrations: repo.integrations ? { ...repo.integrations } : undefined,
    risk: repo.risk
      ? {
          ...repo.risk,
          forbidden_by_default: repo.risk.forbidden_by_default
            ? [...repo.risk.forbidden_by_default]
            : undefined,
          high_risk_paths: repo.risk.high_risk_paths
            ? [...repo.risk.high_risk_paths]
            : undefined,
          medium_risk_paths: repo.risk.medium_risk_paths
            ? [...repo.risk.medium_risk_paths]
            : undefined,
        }
      : undefined,
    agents: repo.agents ? { ...repo.agents } : undefined,
    tags: repo.tags ? [...repo.tags] : undefined,
  };
}
