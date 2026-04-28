import { access, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import type { ValidationMessage, ValidationResult, Workspace } from "../types";
import { isRepoType, validateWorkspaceShape } from "./schema";

export interface ValidateWorkspaceOptions {
  workspaceFile?: string;
  checkPackageScripts?: boolean;
}

export async function validateWorkspace(
  workspace: Workspace,
  options: ValidateWorkspaceOptions = {},
): Promise<ValidationResult> {
  const issues: ValidationMessage[] = [...validateWorkspaceShape(workspace)];

  if (options.workspaceFile) {
    try {
      await access(options.workspaceFile);
    } catch {
      issues.push({
        level: "error",
        message: `workspace file does not exist: ${options.workspaceFile}`,
      });
    }
  }

  for (const [name, repo] of Object.entries(workspace.repos)) {
    if (!repo.path) {
      continue;
    }

    const repoPath = expandHome(repo.path);
    const pathExists = await exists(repoPath);
    if (!pathExists) {
      issues.push({
        level: "error",
        repo: name,
        message: `path does not exist: ${repo.path}`,
      });
      continue;
    }

    if (!(await exists(join(repoPath, ".git")))) {
      issues.push({
        level: "error",
        repo: name,
        message: "path is not a Git repo",
      });
    }

    if (repo.type !== undefined && !isRepoType(repo.type)) {
      issues.push({
        level: "error",
        repo: name,
        message: `invalid repo type: ${repo.type}`,
      });
    }

    if (!repo.default_base) {
      issues.push({
        level: "warning",
        repo: name,
        message: "default_base missing",
      });
    }

    if (!repo.remote) {
      issues.push({ level: "warning", repo: name, message: "remote missing" });
    }

    if (repo.docs_url && !isValidDocsUrl(repo.docs_url)) {
      issues.push({
        level: "warning",
        repo: name,
        message: `docs_url is not a valid-looking URL: ${repo.docs_url}`,
      });
    }

    if (repo.risk?.production_sensitive) {
      if (!hasEntries(repo.risk.forbidden_by_default)) {
        issues.push({
          level: "warning",
          repo: name,
          message: "production_sensitive true but no forbidden_by_default configured",
        });
      }
      if (!hasEntries(repo.risk.high_risk_paths)) {
        issues.push({
          level: "warning",
          repo: name,
          message: "production_sensitive true but no high_risk_paths configured",
        });
      }
    }

    if (repo.agents) {
      if (!repo.agents.requires_branch) {
        issues.push({
          level: "warning",
          repo: name,
          message: "agents policy should require branch",
        });
      }
      if (!repo.agents.review_pack_required) {
        issues.push({
          level: "warning",
          repo: name,
          message: "agents policy should require review pack",
        });
      }
    }

    if (options.checkPackageScripts !== false && repo.commands) {
      issues.push(...(await validatePackageScripts(name, repoPath, repo.commands)));
    }
  }

  return {
    valid: !issues.some((issue) => issue.level === "error"),
    issues,
  };
}

export function formatValidationMessages(messages: ValidationMessage[]): string {
  return messages
    .map((issue) => {
      const mark =
        issue.level === "error" ? "x" : issue.level === "warning" ? "!" : "i";
      const subject = issue.repo ? `${issue.repo}: ` : "";
      return `${mark} ${subject}${issue.message}`;
    })
    .join("\n");
}

function expandHome(path: string): string {
  if (path === "~") {
    return homedir();
  }

  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }

  return resolve(path);
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function hasEntries(value: string[] | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isValidDocsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function validatePackageScripts(
  repoName: string,
  repoPath: string,
  commands: Record<string, string | undefined>,
): Promise<ValidationMessage[]> {
  const packageJsonPath = join(repoPath, "package.json");
  if (!(await exists(packageJsonPath))) {
    return [];
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };
  const scripts = packageJson.scripts ?? {};
  const issues: ValidationMessage[] = [];

  for (const [key, command] of Object.entries(commands)) {
    if (!command) {
      continue;
    }

    const scriptName = getReferencedPackageScript(command);

    if (scriptName && !scripts[scriptName]) {
      issues.push({
        level: "warning",
        repo: repoName,
        message: `command "${key}" references missing package script: ${scriptName}`,
      });
    }
  }

  return issues;
}

function getReferencedPackageScript(command: string): string | undefined {
  const runScript = command.match(/\b(?:npm|pnpm|yarn|bun) run ([\w:-]+)/)?.[1];
  if (runScript) {
    return runScript;
  }

  const directScript = command.match(/\b(?:npm|pnpm|yarn|bun) ([\w:-]+)/)?.[1];
  if (!directScript || isPackageManagerBuiltIn(directScript)) {
    return undefined;
  }

  return directScript;
}

function isPackageManagerBuiltIn(command: string): boolean {
  return command === "ci" || command === "install" || command === "add";
}
