import type { WorkspaceAgentPolicy, WorkspaceDefaults } from "../types";

export const DEFAULT_WORKSPACE_VERSION = "0.1";

export const defaultWorkspaceDefaults: Required<WorkspaceDefaults> = {
  default_base: "main",
  requires_branch: true,
  requires_pr: true,
  review_pack_required: true,
  forbidden_by_default: [".env*", "secrets/**", "credentials/**"],
};

export const defaultAgentPolicy: Required<WorkspaceAgentPolicy> = {
  requires_branch: true,
  requires_pr: true,
  review_pack_required: true,
  human_approval_required: false,
};
