import type { Workspace, WorkspaceAgentPolicy, WorkspaceRepo } from "../types";

export function inspectRepo(workspace: Workspace, name: string): string {
  const repo = workspace.repos[name];
  if (!repo) {
    throw new Error(`Unknown repo: ${name}`);
  }

  return [
    `Repo: ${name}`,
    `Path: ${repo.path}`,
    `Remote: ${value(repo.remote)}`,
    `Type: ${value(repo.type)}`,
    `Base: ${value(repo.default_base ?? workspace.defaults?.default_base)}`,
    `Package manager: ${value(repo.package_manager)}`,
    "",
    "Commands:",
    ...formatCommands(repo),
    "",
    "Docs:",
    ...formatDocs(repo),
    "",
    "Agent context:",
    `AGENTS: ${value(repo.files?.agents)}`,
    `Branchbrief: ${formatBoolean(repo.integrations?.branchbrief)}`,
    "",
    "Risk:",
    `Production sensitive: ${formatBoolean(repo.risk?.production_sensitive)}`,
    `Forbidden by default: ${formatList(
      repo.risk?.forbidden_by_default ?? workspace.defaults?.forbidden_by_default,
    )}`,
    `High risk paths: ${formatList(repo.risk?.high_risk_paths)}`,
    "",
    "PR policy:",
    ...formatPrPolicy(repo.agents, workspace.defaults),
  ].join("\n");
}

function formatCommands(repo: WorkspaceRepo): string[] {
  const commands = Object.entries(repo.commands ?? {}).filter(
    ([, command]) => command,
  );

  if (commands.length === 0) {
    return ["- none"];
  }

  return commands
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, command]) => `- ${key}: ${command}`);
}

function formatDocs(repo: WorkspaceRepo): string[] {
  const docs = [
    repo.docs_url ? `- URL: ${repo.docs_url}` : undefined,
    repo.files?.readme ? `- README: ${repo.files.readme}` : undefined,
    repo.files?.changelog ? `- Changelog: ${repo.files.changelog}` : undefined,
    repo.files?.roadmap ? `- Roadmap: ${repo.files.roadmap}` : undefined,
  ].filter((line): line is string => Boolean(line));

  return docs.length > 0 ? docs : ["- none"];
}

function formatPrPolicy(
  agents: WorkspaceAgentPolicy | undefined,
  defaults: Workspace["defaults"],
): string[] {
  return [
    `Requires branch: ${formatBoolean(
      agents?.requires_branch ?? defaults?.requires_branch,
    )}`,
    `Requires PR: ${formatBoolean(agents?.requires_pr ?? defaults?.requires_pr)}`,
    `Review pack required: ${formatBoolean(
      agents?.review_pack_required ?? defaults?.review_pack_required,
    )}`,
    `Human approval required: ${formatBoolean(agents?.human_approval_required)}`,
  ];
}

function value(input: unknown): string {
  return input === undefined || input === null || input === "" ? "unknown" : String(input);
}

function formatBoolean(input: boolean | undefined): string {
  if (input === undefined) {
    return "unknown";
  }

  return input ? "yes" : "no";
}

function formatList(input: string[] | undefined): string {
  return input && input.length > 0 ? input.join(", ") : "none";
}
