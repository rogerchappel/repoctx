export const REPO_TYPES = [
  "oss-cli",
  "oss-library",
  "docs-site",
  "github-action",
  "template",
  "product",
  "production-saas",
  "company",
  "client",
  "internal-tool",
  "experiment",
  "unknown",
] as const;

export const COMMAND_KEYS = [
  "install",
  "test",
  "build",
  "typecheck",
  "lint",
  "format",
  "dev",
  "docs",
  "release_check",
] as const;

export const PACKAGE_MANAGERS = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "deno",
  "unknown",
] as const;

export type RepoType = (typeof REPO_TYPES)[number];
export type CommandKey = (typeof COMMAND_KEYS)[number];
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export type WorkspaceCommands = Partial<Record<CommandKey, string>> &
  Record<string, string | undefined>;

export interface WorkspaceDefaults {
  default_base?: string;
  requires_branch?: boolean;
  requires_pr?: boolean;
  review_pack_required?: boolean;
  forbidden_by_default?: string[];
}

export interface WorkspaceFiles {
  agents?: string;
  changelog?: string;
  roadmap?: string;
  readme?: string;
  license?: string;
  package_json?: string;
  [key: string]: string | undefined;
}

export interface WorkspaceIntegrations {
  branchbrief?: boolean;
  taskbrief?: boolean;
  crewcmd?: boolean;
  [key: string]: boolean | undefined;
}

export interface WorkspaceRiskPolicy {
  production_sensitive?: boolean;
  forbidden_by_default?: string[];
  high_risk_paths?: string[];
  medium_risk_paths?: string[];
}

export interface WorkspaceAgentPolicy {
  requires_branch?: boolean;
  requires_pr?: boolean;
  review_pack_required?: boolean;
  human_approval_required?: boolean;
}

export interface WorkspaceRepo {
  path: string;
  remote?: string;
  type?: RepoType;
  default_base?: string;
  docs_url?: string;
  package_manager?: PackageManager;
  commands?: WorkspaceCommands;
  files?: WorkspaceFiles;
  integrations?: WorkspaceIntegrations;
  risk?: WorkspaceRiskPolicy;
  agents?: WorkspaceAgentPolicy;
  tags?: string[];
  notes?: string;
}

export interface Workspace {
  version?: string;
  workspace?: string;
  defaults?: WorkspaceDefaults;
  repos: Record<string, WorkspaceRepo>;
}

export interface ValidationMessage {
  level: "error" | "warning" | "info";
  repo?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationMessage[];
}

export interface MergeWorkspaceOptions {
  removeMissing?: boolean;
}
