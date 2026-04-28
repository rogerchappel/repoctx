#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { inspectRepo } from "./inspect/inspectRepo";
import { formatTable } from "./output/table";
import type { RepoType, Workspace, WorkspaceRepo } from "./types";
import { findWorkspaceFile } from "./workspace/findWorkspaceFile";
import { loadWorkspace } from "./workspace/loadWorkspace";
import { REPO_TYPES } from "./workspace/schema";
import {
  formatValidationMessages,
  validateWorkspace,
} from "./workspace/validateWorkspace";
import { stringifyWorkspaceForCli, writeWorkspace } from "./workspace/writeWorkspace";

export interface CliCommand {
  readonly name: string;
  readonly summary: string;
  readonly status: "ready" | "todo";
}

export interface CliIO {
  readonly stdout: Pick<NodeJS.WriteStream, "write">;
  readonly stderr: Pick<NodeJS.WriteStream, "write">;
  readonly cwdPath?: string;
}

export const COMMANDS: readonly CliCommand[] = [
  {
    name: "init",
    summary: "Create a workspace file.",
    status: "ready",
  },
  {
    name: "scan",
    summary: "Scan a repository and prepare context metadata.",
    status: "todo",
  },
  {
    name: "add",
    summary: "Add or update a repository entry in the workspace file.",
    status: "ready",
  },
  {
    name: "inspect",
    summary: "Inspect planned repository context before export.",
    status: "ready",
  },
  {
    name: "validate",
    summary: "Validate repoctx configuration and context inputs.",
    status: "ready",
  },
  {
    name: "export",
    summary: "Export the workspace file as YAML or JSON.",
    status: "ready",
  },
  {
    name: "doctor",
    summary: "Run environment and repository health checks.",
    status: "ready",
  },
  {
    name: "list",
    summary: "List configured repoctx entries.",
    status: "ready",
  },
  {
    name: "remove",
    summary: "Remove a repository entry from the workspace file.",
    status: "ready",
  },
  {
    name: "update",
    summary: "Update fields on a repository entry.",
    status: "ready",
  },
];

const VERSION = "0.1.0";
const DEFAULT_WORKSPACE_FILES = [
  "workspace.yaml",
  "workspace.yml",
  "workspace.json",
  "repoctx.yaml",
  "repoctx.yml",
  "repoctx.json",
] as const;

export function buildHelpText(): string {
  const commandWidth = Math.max(...COMMANDS.map((command) => command.name.length));
  const commands = COMMANDS.map(
    (command) => `  ${command.name.padEnd(commandWidth)}  ${command.summary}`,
  ).join("\n");

  return [
    "repoctx",
    "",
    "Repository context tooling for agentic development workflows.",
    "",
    "Usage:",
    "  repoctx --help",
    "  repoctx <command> [options]",
    "",
    "Commands:",
    commands,
    "",
    "Options:",
    "  -h, --help              Show help.",
    "  -v, --version           Show version.",
    "  --workspace <file>      Use a specific workspace file.",
  ].join("\n");
}

export async function runCli(
  argv = process.argv.slice(2),
  io: CliIO = process,
): Promise<number> {
  const [commandName, ...args] = argv;

  if (!commandName || commandName === "--help" || commandName === "-h") {
    io.stdout.write(`${buildHelpText()}\n`);
    return 0;
  }

  if (commandName === "--version" || commandName === "-v") {
    io.stdout.write(`${VERSION}\n`);
    return 0;
  }

  const command = COMMANDS.find((candidate) => candidate.name === commandName);

  if (!command) {
    io.stderr.write(`Unknown command: ${commandName}\n\n${buildHelpText()}\n`);
    return 1;
  }

  if (args.includes("--help") || args.includes("-h")) {
    io.stdout.write(`${buildCommandHelpText(command)}\n`);
    return 0;
  }

  try {
    switch (command.name) {
      case "init":
        return await runInit(args, io);
      case "add":
        return await runAdd(args, io);
      case "remove":
        return await runRemove(args, io);
      case "update":
        return await runUpdate(args, io);
      case "export":
        return await runExport(args, io);
      case "validate":
        return await runValidate(parseOptions(args), io);
      case "inspect":
        return await runInspect(parseOptions(args), io);
      case "list":
        return await runList(parseOptions(args), io);
      case "doctor":
        return await runDoctor(parseOptions(args), io);
      default:
        io.stdout.write(
          `repoctx ${command.name}: TODO placeholder. ${command.summary} No files were changed.\n`,
        );
        return 0;
    }
  } catch (error) {
    io.stderr.write(`${formatError(error)}\n`);
    return 1;
  }
}

function buildCommandHelpText(command: CliCommand): string {
  const commonOptions = [
    "Options:",
    "  --workspace <file>  Workspace file to read.",
    "  -h, --help          Show help.",
  ];

  switch (command.name) {
    case "init":
      return [
        "repoctx init",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx init [--output <file>] [--force]",
        "",
        "Options:",
        "  --output <file>  Workspace file to create. Defaults to workspace.yaml.",
        "  --force          Overwrite an existing output file.",
        "  -h, --help       Show help.",
      ].join("\n");
    case "add":
      return [
        "repoctx add <name> --path <path>",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx add <name> --path <path> [--workspace <file>]",
        "",
        ...commonOptions,
      ].join("\n");
    case "remove":
      return [
        "repoctx remove <name>",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx remove <name> [--workspace <file>]",
        "",
        ...commonOptions,
      ].join("\n");
    case "update":
      return [
        "repoctx update <name>",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx update <name> [field flags] [--workspace <file>]",
        "",
        "Field flags:",
        "  --path <path>",
        "  --remote <url>",
        "  --type <type>",
        "  --default-base <branch>",
        "  --docs-url <url>",
        "  --tag <tag>",
        "",
        ...commonOptions,
      ].join("\n");
    case "export":
      return [
        "repoctx export --format yaml|json",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx export --format yaml|json [--output <file>] [--workspace <file>]",
        "",
        "Options:",
        "  --format <format>  Output format: yaml or json.",
        "  --output <file>    Write output to a file instead of stdout.",
        "  --workspace <file> Workspace file to read.",
        "  -h, --help         Show help.",
      ].join("\n");
    case "inspect":
      return [
        "repoctx inspect <name>",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx inspect <name> [--workspace <file>]",
        "",
        ...commonOptions,
      ].join("\n");
    case "validate":
      return [
        "repoctx validate",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx validate [--workspace <file>]",
        "",
        ...commonOptions,
      ].join("\n");
    case "doctor":
      return [
        "repoctx doctor",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx doctor [--workspace <file>]",
        "",
        ...commonOptions,
      ].join("\n");
    case "list":
      return [
        "repoctx list",
        "",
        command.summary,
        "",
        "Usage:",
        "  repoctx list [--workspace <file>] [--type <type>] [--tag <tag>]",
        "",
        ...commonOptions,
      ].join("\n");
    default:
      return [
        `repoctx ${command.name}`,
        "",
        command.summary,
        "",
        "Status: TODO. This placeholder is non-mutating and not implemented yet.",
      ].join("\n");
  }
}

async function runInit(args: string[], io: CliIO): Promise<number> {
  const options = parseOptions(args);
  ensureNoPositionals(options, "init");
  const output = resolve(getCwd(io), options.getOne("output") ?? "workspace.yaml");

  if (!options.has("force") && await pathExists(output)) {
    throw new Error(`Workspace file already exists: ${output}. Use --force to overwrite.`);
  }

  await writeWorkspace(output, createEmptyWorkspace());
  io.stdout.write(`Created ${output}\n`);
  return 0;
}

async function runAdd(args: string[], io: CliIO): Promise<number> {
  const options = parseOptions(args);
  const name = getRepoName(options, "add");
  const repoPath = options.getOne("path");
  if (!repoPath) {
    throw new Error("repoctx add requires --path <path>.");
  }

  const { filePath, workspace } = await readExistingWorkspace(
    options.getOne("workspace"),
    getCwd(io),
  );
  const current = workspace.repos[name] ?? {};
  workspace.repos[name] = {
    ...current,
    path: repoPath,
    ...repoFieldUpdates(options),
  };

  await writeWorkspace(filePath, workspace);
  io.stdout.write(`Saved ${name} in ${filePath}\n`);
  return 0;
}

async function runRemove(args: string[], io: CliIO): Promise<number> {
  const options = parseOptions(args);
  const name = getRepoName(options, "remove");
  const { filePath, workspace } = await readExistingWorkspace(
    options.getOne("workspace"),
    getCwd(io),
  );

  if (!workspace.repos[name]) {
    throw new Error(`Workspace repo entry not found: ${name}`);
  }

  delete workspace.repos[name];
  await writeWorkspace(filePath, workspace);
  io.stdout.write(`Removed ${name} from ${filePath}\n`);
  return 0;
}

async function runUpdate(args: string[], io: CliIO): Promise<number> {
  const options = parseOptions(args);
  const name = getRepoName(options, "update");
  const updates = repoFieldUpdates(options);

  if (Object.keys(updates).length === 0) {
    throw new Error("repoctx update requires at least one field flag.");
  }

  const { filePath, workspace } = await readExistingWorkspace(
    options.getOne("workspace"),
    getCwd(io),
  );
  const current = workspace.repos[name];
  if (!current) {
    throw new Error(`Workspace repo entry not found: ${name}`);
  }

  workspace.repos[name] = { ...current, ...updates };
  await writeWorkspace(filePath, workspace);
  io.stdout.write(`Updated ${name} in ${filePath}\n`);
  return 0;
}

async function runExport(args: string[], io: CliIO): Promise<number> {
  const options = parseOptions(args);
  ensureNoPositionals(options, "export");
  const format = options.getOne("format");
  if (format !== "yaml" && format !== "json") {
    throw new Error("repoctx export requires --format yaml or --format json.");
  }

  const { workspace } = await readExistingWorkspace(
    options.getOne("workspace"),
    getCwd(io),
  );
  const contents = stringifyWorkspaceForCli(workspace, format);
  const output = options.getOne("output");

  if (output) {
    const outputPath = resolve(getCwd(io), output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, contents, "utf8");
    io.stdout.write(`Exported ${format} to ${outputPath}\n`);
  } else {
    io.stdout.write(contents);
  }

  return 0;
}

async function runValidate(
  options: ParsedOptions,
  io: CliIO,
): Promise<number> {
  const workspaceFile = await resolveWorkspaceFile(options.getOne("workspace"), getCwd(io));
  const workspace = await loadWorkspace(workspaceFile);
  const result = await validateWorkspace(workspace, { workspaceFile });
  const errors = result.issues.filter((issue) => issue.level === "error");
  const warnings = result.issues.filter((issue) => issue.level === "warning");

  io.stdout.write(`Workspace: ${workspaceFile}\n`);
  io.stdout.write(`Repos: ${Object.keys(workspace.repos).length}\n`);

  if (result.issues.length > 0) {
    io.stdout.write(`${formatValidationMessages(result.issues)}\n`);
  } else {
    io.stdout.write("ok workspace is valid\n");
  }

  io.stdout.write(
    `Summary: ${errors.length} error(s), ${warnings.length} warning(s)\n`,
  );

  return errors.length > 0 ? 1 : 0;
}

async function runInspect(
  options: ParsedOptions,
  io: CliIO,
): Promise<number> {
  const [name] = options.positionals;
  if (!name || options.positionals.length > 1) {
    throw new Error("Missing repo name. Usage: repoctx inspect <name>");
  }

  const workspaceFile = await resolveWorkspaceFile(options.getOne("workspace"), getCwd(io));
  const workspace = await loadWorkspace(workspaceFile);

  if (!workspace.repos[name]) {
    throw new Error(`Unknown repo: ${name}`);
  }

  io.stdout.write(`${inspectRepo(workspace, name)}\n`);
  return 0;
}

async function runList(options: ParsedOptions, io: CliIO): Promise<number> {
  ensureNoPositionals(options, "list");
  const workspaceFile = await resolveWorkspaceFile(options.getOne("workspace"), getCwd(io));
  const workspace = await loadWorkspace(workspaceFile);
  const rows = listRows(workspace, options);

  if (rows.length === 0) {
    io.stdout.write("No repos matched.\n");
    return 0;
  }

  io.stdout.write(
    formatTable(rows, [
      { key: "name", header: "Name" },
      { key: "type", header: "Type" },
      { key: "tags", header: "Tags" },
      { key: "path", header: "Path" },
    ]),
  );
  return 0;
}

async function runDoctor(options: ParsedOptions, io: CliIO): Promise<number> {
  ensureNoPositionals(options, "doctor");
  const cwd = getCwd(io);
  const checks: Array<{ status: "ok" | "warn" | "error"; message: string }> = [];

  checks.push({
    status: "ok",
    message: `node ${process.versions.node}`,
  });

  checks.push(
    (await pathExists(join(cwd, "package.json")))
      ? { status: "ok", message: "package.json found" }
      : { status: "error", message: "package.json missing in current directory" },
  );

  checks.push(
    (await pathExists(join(cwd, "node_modules")))
      ? { status: "ok", message: "dependencies installed" }
      : { status: "warn", message: "node_modules missing; run npm ci" },
  );

  const workspaceFile = await findWorkspaceFile(options.getOne("workspace"), cwd);
  if (!workspaceFile || !await pathExists(workspaceFile)) {
    checks.push({
      status: options.has("workspace") ? "error" : "warn",
      message: options.has("workspace")
        ? `workspace file not found: ${options.getOne("workspace")}`
        : `workspace file not found; checked ${DEFAULT_WORKSPACE_FILES.join(", ")}`,
    });
  } else {
    checks.push({ status: "ok", message: `workspace file found: ${workspaceFile}` });

    try {
      const workspace = await loadWorkspace(workspaceFile);
      const result = await validateWorkspace(workspace, { workspaceFile });
      const errors = result.issues.filter((issue) => issue.level === "error");
      const warnings = result.issues.filter((issue) => issue.level === "warning");

      checks.push(
        errors.length === 0
          ? {
              status: warnings.length > 0 ? "warn" : "ok",
              message: `workspace validation: ${errors.length} error(s), ${warnings.length} warning(s)`,
            }
          : {
              status: "error",
              message: `workspace validation: ${errors.length} error(s), ${warnings.length} warning(s)`,
            },
      );
    } catch (error) {
      checks.push({
        status: "error",
        message: `workspace could not be loaded: ${formatError(error)}`,
      });
    }
  }

  const errors = checks.filter((check) => check.status === "error");
  const warnings = checks.filter((check) => check.status === "warn");

  io.stdout.write("repoctx doctor\n");
  for (const check of checks) {
    io.stdout.write(`${formatCheckStatus(check.status)} ${check.message}\n`);
  }

  io.stdout.write(
    `Summary: ${errors.length} error(s), ${warnings.length} warning(s)\n`,
  );

  if (errors.length > 0 || warnings.length > 0) {
    io.stdout.write("Next actions:\n");
    if (errors.length > 0) {
      io.stdout.write("- Fix error checks before relying on workspace context.\n");
    }
    if (warnings.length > 0) {
      io.stdout.write("- Review warning checks to improve generated context.\n");
    }
  } else {
    io.stdout.write("Next actions: none\n");
  }

  return errors.length > 0 ? 1 : 0;
}

function listRows(workspace: Workspace, options: ParsedOptions) {
  const type = options.getOne("type");
  const tag = options.getOne("tag");

  return Object.entries(workspace.repos)
    .filter(([, repo]) => !type || repo.type === type)
    .filter(([, repo]) => !tag || repo.tags?.includes(tag))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, repo]) => ({
      name,
      type: repo.type ?? "",
      tags: repo.tags?.join(", ") ?? "",
      path: repo.path,
    }));
}

async function readExistingWorkspace(
  explicitPath?: string,
  cwd = process.cwd(),
): Promise<{ filePath: string; workspace: Workspace }> {
  const filePath = await resolveWorkspaceFile(explicitPath, cwd);
  return { filePath, workspace: await loadWorkspace(filePath) };
}

async function resolveWorkspaceFile(
  explicitPath?: string,
  cwd = process.cwd(),
): Promise<string> {
  if (explicitPath) {
    const filePath = resolve(cwd, explicitPath);
    if (await pathExists(filePath)) {
      return filePath;
    }

    throw new Error(`Workspace file not found: ${filePath}`);
  }

  const filePath = await findWorkspaceFile(undefined, cwd);
  if (!filePath) {
    throw new Error("Workspace file not found. Use --workspace <file> or run repoctx init.");
  }

  return filePath;
}

function createEmptyWorkspace(): Workspace {
  return {
    version: "0.1",
    repos: {},
  };
}

function repoFieldUpdates(options: ParsedOptions): Partial<WorkspaceRepo> {
  const updates: Partial<WorkspaceRepo> = {};
  setOptionalString(updates, "path", options.getOne("path"));
  setOptionalString(updates, "remote", options.getOne("remote"));
  setOptionalRepoType(updates, options.getOne("type"));
  setOptionalString(updates, "default_base", options.getOne("default-base"));
  setOptionalString(updates, "docs_url", options.getOne("docs-url"));

  const tags = options.getMany("tag");
  if (tags.length > 0) {
    updates.tags = unique(tags);
  }

  return updates;
}

function setOptionalString<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: string | undefined,
): void {
  if (value !== undefined) {
    target[key] = value as T[K];
  }
}

function setOptionalRepoType(
  target: Partial<WorkspaceRepo>,
  value: string | undefined,
): void {
  if (value === undefined) {
    return;
  }

  if (!isRepoTypeValue(value)) {
    throw new Error(`Invalid repo type: ${value}. Expected one of: ${REPO_TYPES.join(", ")}`);
  }

  target.type = value;
}

function isRepoTypeValue(value: string): value is RepoType {
  return (REPO_TYPES as readonly string[]).includes(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function getRepoName(options: ParsedOptions, commandName: string): string {
  const [name, ...extra] = options.positionals;
  if (!name || extra.length > 0) {
    throw new Error(`repoctx ${commandName} requires exactly one <name>.`);
  }

  return name;
}

function ensureNoPositionals(options: ParsedOptions, commandName: string): void {
  if (options.positionals.length > 0) {
    throw new Error(`repoctx ${commandName} does not accept positional arguments.`);
  }
}

class ParsedOptions {
  readonly positionals: string[] = [];
  private readonly flags = new Map<string, string[]>();

  addFlag(name: string, value: string): void {
    this.flags.set(name, [...this.getMany(name), value]);
  }

  has(name: string): boolean {
    return this.flags.has(name);
  }

  getOne(name: string): string | undefined {
    const values = this.getMany(name);
    if (values.length > 1) {
      throw new Error(`Option --${name} can only be provided once.`);
    }

    return values[0];
  }

  getMany(name: string): string[] {
    return this.flags.get(name) ?? [];
  }
}

const VALUE_FLAGS = new Set([
  "default-base",
  "docs-url",
  "format",
  "output",
  "path",
  "remote",
  "tag",
  "type",
  "workspace",
]);

const BOOLEAN_FLAGS = new Set(["force"]);

function parseOptions(args: string[]): ParsedOptions {
  const options = new ParsedOptions();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      options.positionals.push(arg);
      continue;
    }

    const equalsIndex = arg.indexOf("=");
    const name = equalsIndex === -1 ? arg.slice(2) : arg.slice(2, equalsIndex);
    if (BOOLEAN_FLAGS.has(name)) {
      if (equalsIndex !== -1) {
        throw new Error(`Option --${name} does not accept a value.`);
      }

      options.addFlag(name, "true");
      continue;
    }

    if (!VALUE_FLAGS.has(name)) {
      throw new Error(`Unknown option: --${name}`);
    }

    const value = equalsIndex === -1 ? args[index + 1] : arg.slice(equalsIndex + 1);
    if (!value || value.startsWith("--")) {
      throw new Error(`Option --${name} requires a value.`);
    }

    options.addFlag(name, value);
    if (equalsIndex === -1) {
      index += 1;
    }
  }

  return options;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatCheckStatus(status: "ok" | "warn" | "error"): string {
  switch (status) {
    case "ok":
      return "ok";
    case "warn":
      return "!";
    case "error":
      return "x";
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getCwd(io: CliIO): string {
  return io.cwdPath ?? process.cwd();
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isEntrypoint) {
  process.exitCode = await runCli();
}
