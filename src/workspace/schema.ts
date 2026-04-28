import {
  COMMAND_KEYS,
  PACKAGE_MANAGERS,
  REPO_TYPES,
  type CommandKey,
  type PackageManager,
  type RepoType,
  type ValidationMessage,
  type Workspace,
  type WorkspaceRepo,
} from "../types";

export { COMMAND_KEYS, PACKAGE_MANAGERS, REPO_TYPES };

const repoTypeSet = new Set<string>(REPO_TYPES);
const commandKeySet = new Set<string>(COMMAND_KEYS);
const packageManagerSet = new Set<string>(PACKAGE_MANAGERS);

export function isRepoType(value: unknown): value is RepoType {
  return typeof value === "string" && repoTypeSet.has(value);
}

export function isCommandKey(value: unknown): value is CommandKey {
  return typeof value === "string" && commandKeySet.has(value);
}

export function isPackageManager(value: unknown): value is PackageManager {
  return typeof value === "string" && packageManagerSet.has(value);
}

export function assertWorkspace(value: unknown): Workspace {
  const issues = validateWorkspaceShape(value);
  if (issues.length > 0) {
    throw new Error(
      issues.map((issue) => formatShapeIssue(issue)).join("\n"),
    );
  }

  return value as Workspace;
}

export function validateWorkspaceShape(value: unknown): ValidationMessage[] {
  const issues: ValidationMessage[] = [];

  if (!isRecord(value)) {
    return [{ level: "error", message: "workspace must be an object" }];
  }

  if (!isOptionalString(value.version)) {
    issues.push({ level: "error", message: "version must be a string" });
  }

  if (!isOptionalString(value.workspace)) {
    issues.push({ level: "error", message: "workspace must be a string" });
  }

  if (!isRecord(value.repos)) {
    issues.push({ level: "error", message: "repos must be an object" });
    return issues;
  }

  for (const [name, repo] of Object.entries(value.repos)) {
    validateRepoShape(name, repo, issues);
  }

  return issues;
}

export function normalizeWorkspace(value: Workspace): Workspace {
  return {
    ...value,
    repos: Object.fromEntries(
      Object.entries(value.repos).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  };
}

function validateRepoShape(
  name: string,
  value: unknown,
  issues: ValidationMessage[],
): void {
  if (!isRecord(value)) {
    issues.push({
      level: "error",
      repo: name,
      message: "repo entry must be an object",
    });
    return;
  }

  const repo = value as Partial<WorkspaceRepo>;

  if (!isNonEmptyString(repo.path)) {
    issues.push({
      level: "error",
      repo: name,
      message: "path is required",
    });
  }

  if (repo.type !== undefined && !isRepoType(repo.type)) {
    issues.push({
      level: "error",
      repo: name,
      message: `type must be one of: ${REPO_TYPES.join(", ")}`,
    });
  }

  if (
    repo.package_manager !== undefined &&
    !isPackageManager(repo.package_manager)
  ) {
    issues.push({
      level: "error",
      repo: name,
      message: `package_manager must be one of: ${PACKAGE_MANAGERS.join(", ")}`,
    });
  }

  if (repo.commands !== undefined) {
    if (!isRecord(repo.commands)) {
      issues.push({ level: "error", repo: name, message: "commands must be an object" });
    } else {
      for (const [key, command] of Object.entries(repo.commands)) {
        if (!isCommandKey(key)) {
          issues.push({
            level: "warning",
            repo: name,
            message: `unknown command key: ${key}`,
          });
        }
        if (command !== undefined && typeof command !== "string") {
          issues.push({
            level: "error",
            repo: name,
            message: `commands.${key} must be a string`,
          });
        }
      }
    }
  }
}

function formatShapeIssue(issue: ValidationMessage): string {
  return issue.repo ? `${issue.repo}: ${issue.message}` : issue.message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// TODO: Replace this lightweight validator with a zod schema when the package
// scaffold declares zod. The PRD recommends zod, but origin/main currently has
// no dependency manifest to extend.
export const workspaceSchema = {
  parse: assertWorkspace,
  safeParse(value: unknown):
    | { success: true; data: Workspace }
    | { success: false; error: { issues: ValidationMessage[] } } {
    const issues = validateWorkspaceShape(value);
    if (issues.length > 0) {
      return { success: false, error: { issues } };
    }

    return { success: true, data: value as Workspace };
  },
};
