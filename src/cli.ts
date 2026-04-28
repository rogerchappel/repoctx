#!/usr/bin/env node

import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { inspectRepo } from "./inspect/inspectRepo";
import { stringifyWorkspaceJson } from "./output/json";
import { formatTable } from "./output/table";
import { stringifyWorkspaceYaml } from "./output/yaml";
import { scanWorkspace } from "./scan/scanWorkspace";
import type { Workspace } from "./types";
import { loadWorkspace } from "./workspace/loadWorkspace";
import { mergeWorkspace } from "./workspace/mergeWorkspace";
import {
  formatValidationMessages,
  validateWorkspace,
} from "./workspace/validateWorkspace";
import { writeWorkspace } from "./workspace/writeWorkspace";

export interface CliCommand {
  readonly name: string;
  readonly summary: string;
  readonly status: "ready" | "todo";
}

export interface CliIO {
  readonly stdout: Pick<NodeJS.WriteStream, "write">;
  readonly stderr: Pick<NodeJS.WriteStream, "write">;
}

export const COMMANDS: readonly CliCommand[] = [
  {
    name: "init",
    summary: "Initialize repoctx configuration for a repository.",
    status: "todo",
  },
  {
    name: "scan",
    summary: "Scan a repository and prepare context metadata.",
    status: "ready",
  },
  {
    name: "add",
    summary: "Add files, directories, or patterns to repoctx scope.",
    status: "todo",
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
    summary: "Export repository context for downstream tools.",
    status: "todo",
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
    summary: "Remove files, directories, or patterns from repoctx scope.",
    status: "todo",
  },
  {
    name: "update",
    summary: "Update repoctx metadata after repository changes.",
    status: "todo",
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
    "",
    "Run repoctx <command> --help for command-specific options.",
  ].join("\n");
}

export function runCli(
  argv = process.argv.slice(2),
  io: CliIO = process,
): number | Promise<number> {
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
    io.stdout.write(`${buildCommandHelp(command)}\n`);
    return 0;
  }

  if (command.name === "scan") {
    return runScanCommand(args, io);
  }

  if (command.status === "ready") {
    return runWorkspaceCommand(command.name, args, io);
  }

  io.stdout.write(
    `repoctx ${command.name}: TODO placeholder. ${command.summary} No files were changed.\n`,
  );
  return 0;
}

function buildCommandHelp(command: CliCommand): string {
  const common = [
    `repoctx ${command.name}`,
    "",
    command.summary,
    "",
  ];

  if (command.name === "scan") {
    return [
      "repoctx scan <path>",
      "",
      "Recursively scan a directory for git repositories and merge discovered",
      "metadata into a repoctx workspace file.",
      "",
      "Options:",
      "  --workspace <file>  Workspace file to read before merging.",
      "  --output <file>     Workspace file to write. Use - to print only.",
      "  --format <format>   Output format: yaml or json.",
      "  -h, --help          Show help.",
    ].join("\n");
  }

  if (command.status !== "ready") {
    return [
      ...common,
      "Status: TODO. This placeholder is non-mutating and not implemented yet.",
    ].join("\n");
  }

  const usage: Record<string, string[]> = {
    inspect: [
      "Usage:",
      "  repoctx inspect <name> [--workspace <file>]",
    ],
    validate: [
      "Usage:",
      "  repoctx validate [--workspace <file>]",
    ],
    doctor: [
      "Usage:",
      "  repoctx doctor [--workspace <file>]",
    ],
    list: [
      "Usage:",
      "  repoctx list [--workspace <file>] [--type <type>] [--tag <tag>]",
    ],
  };

  return [...common, ...(usage[command.name] ?? [])].join("\n");
}

type OutputFormat = "yaml" | "json";

interface ScanOptions {
  path: string;
  workspaceFile: string;
  outputFile: string;
  outputFormat: OutputFormat;
}

interface ParsedScanOptions extends ScanOptions {
  formatWasExplicit: boolean;
}

async function runScanCommand(args: string[], io: CliIO): Promise<number> {
  let options: ParsedScanOptions;

  try {
    options = parseScanOptions(args);
  } catch (error) {
    io.stderr.write(`${formatError(error)}\n\n${buildCommandHelp(COMMANDS[1])}\n`);
    return 1;
  }

  try {
    const scan = await scanWorkspace(options.path);
    const currentWorkspace = await loadWorkspaceIfExists(options.workspaceFile);
    const merged = mergeWorkspace(currentWorkspace, scan.workspaceRepos);

    if (options.outputFile === "-") {
      io.stdout.write(await stringifyWorkspace(merged, options.outputFormat));
      return 0;
    }

    await writeWorkspaceWithFormat(
      options.outputFile,
      merged,
      options.outputFormat,
      options.formatWasExplicit,
    );
    io.stdout.write(
      `Scanned ${scan.repos.length} repos from ${scan.root}. Wrote ${options.outputFile}.\n`,
    );
    return 0;
  } catch (error) {
    io.stderr.write(`${formatError(error)}\n`);
    return 1;
  }
}

function parseScanOptions(args: string[]): ParsedScanOptions {
  let scanPath: string | undefined;
  let workspaceFile: string | undefined;
  let outputFile: string | undefined;
  let outputFormat: OutputFormat | undefined;
  let formatWasExplicit = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--workspace") {
      workspaceFile = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--output") {
      outputFile = requireOptionValue(args, index, arg, { allowDash: true });
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const value = requireOptionValue(args, index, arg);
      if (value !== "yaml" && value !== "json") {
        throw new Error(`Unsupported format: ${value}`);
      }
      outputFormat = value;
      formatWasExplicit = true;
      index += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (scanPath) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    scanPath = arg;
  }

  if (!scanPath) {
    throw new Error("Missing scan path.");
  }

  const defaultWorkspaceFile = resolve("workspace.yaml");
  const resolvedWorkspaceFile = resolve(
    workspaceFile ?? (outputFile && outputFile !== "-" ? outputFile : defaultWorkspaceFile),
  );
  const resolvedOutputFile = outputFile === "-"
    ? "-"
    : resolve(outputFile ?? workspaceFile ?? defaultWorkspaceFile);

  return {
    path: resolve(scanPath),
    workspaceFile: resolvedWorkspaceFile,
    outputFile: resolvedOutputFile,
    outputFormat: outputFormat ?? inferOutputFormat(resolvedOutputFile),
    formatWasExplicit,
  };
}

async function runWorkspaceCommand(
  commandName: string,
  args: string[],
  io: CliIO,
): Promise<number> {
  try {
    const parsed = parseOptions(args);

    switch (commandName) {
      case "validate":
        return await runValidate(parsed, io);
      case "inspect":
        return await runInspect(parsed, io);
      case "list":
        return await runList(parsed, io);
      case "doctor":
        return await runDoctor(parsed, io);
      default:
        io.stderr.write(`Command is not implemented: ${commandName}\n`);
        return 1;
    }
  } catch (error) {
    io.stderr.write(`${formatError(error)}\n`);
    return 1;
  }
}

interface ParsedOptions {
  readonly positionals: string[];
  readonly workspaceFile?: string;
  readonly type?: string;
  readonly tag?: string;
}

function parseOptions(args: string[]): ParsedOptions {
  const positionals: string[] = [];
  let workspaceFile: string | undefined;
  let type: string | undefined;
  let tag: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--workspace") {
      workspaceFile = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--type") {
      type = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--tag") {
      tag = requireOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("--workspace=")) {
      workspaceFile = arg.slice("--workspace=".length);
      continue;
    }

    if (arg.startsWith("--type=")) {
      type = arg.slice("--type=".length);
      continue;
    }

    if (arg.startsWith("--tag=")) {
      tag = arg.slice("--tag=".length);
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positionals.push(arg);
  }

  return {
    positionals,
    workspaceFile,
    type,
    tag,
  };
}

function requireOptionValue(
  args: string[],
  index: number,
  option: string,
  settings: { allowDash?: boolean } = {},
): string {
  const value = args[index + 1];
  if (!value || (!settings.allowDash && value.startsWith("-"))) {
    throw new Error(`Missing value for ${option}`);
  }

  return value;
}

async function runValidate(
  options: ParsedOptions,
  io: CliIO,
): Promise<number> {
  const workspaceFile = await resolveWorkspaceFile(options.workspaceFile);
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
  if (!name) {
    io.stderr.write("Missing repo name. Usage: repoctx inspect <name>\n");
    return 1;
  }

  const workspaceFile = await resolveWorkspaceFile(options.workspaceFile);
  const workspace = await loadWorkspace(workspaceFile);

  if (!workspace.repos[name]) {
    io.stderr.write(`Unknown repo: ${name}\n`);
    return 1;
  }

  io.stdout.write(`${inspectRepo(workspace, name)}\n`);
  return 0;
}

async function runList(options: ParsedOptions, io: CliIO): Promise<number> {
  const workspaceFile = await resolveWorkspaceFile(options.workspaceFile);
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
  const checks: Array<{ status: "ok" | "warn" | "error"; message: string }> = [];

  checks.push({
    status: "ok",
    message: `node ${process.versions.node}`,
  });

  checks.push(
    (await exists(join(process.cwd(), "package.json")))
      ? { status: "ok", message: "package.json found" }
      : { status: "error", message: "package.json missing in current directory" },
  );

  checks.push(
    (await exists(join(process.cwd(), "node_modules")))
      ? { status: "ok", message: "dependencies installed" }
      : { status: "warn", message: "node_modules missing; run npm ci" },
  );

  const workspaceFile = await findWorkspaceFile(options.workspaceFile);
  if (!workspaceFile) {
    checks.push({
      status: options.workspaceFile ? "error" : "warn",
      message: options.workspaceFile
        ? `workspace file not found: ${options.workspaceFile}`
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
  return Object.entries(workspace.repos)
    .filter(([, repo]) => !options.type || repo.type === options.type)
    .filter(([, repo]) => !options.tag || repo.tags?.includes(options.tag))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, repo]) => ({
      name,
      type: repo.type ?? "",
      tags: repo.tags?.join(", ") ?? "",
      path: repo.path,
    }));
}

async function loadWorkspaceIfExists(filePath: string): Promise<Workspace> {
  if (!(await fileExists(filePath))) {
    return {
      version: "0.1",
      repos: {},
    };
  }

  return loadWorkspace(filePath);
}

async function resolveWorkspaceFile(workspaceFile: string | undefined): Promise<string> {
  const found = await findWorkspaceFile(workspaceFile);
  if (!found) {
    if (workspaceFile) {
      throw new Error(`Workspace file not found: ${workspaceFile}`);
    }

    throw new Error(
      `Workspace file not found. Checked: ${DEFAULT_WORKSPACE_FILES.join(", ")}`,
    );
  }

  return found;
}

async function findWorkspaceFile(
  workspaceFile: string | undefined,
): Promise<string | undefined> {
  if (workspaceFile) {
    const resolved = resolve(workspaceFile);
    return (await exists(resolved)) ? resolved : undefined;
  }

  for (const candidate of DEFAULT_WORKSPACE_FILES) {
    const resolved = resolve(candidate);
    if (await exists(resolved)) {
      return resolved;
    }
  }

  return undefined;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeWorkspaceWithFormat(
  filePath: string,
  workspace: Workspace,
  format: OutputFormat,
  formatWasExplicit: boolean,
): Promise<void> {
  if (!formatWasExplicit) {
    return writeWorkspace(filePath, workspace);
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, await stringifyWorkspace(workspace, format), "utf8");
}

async function stringifyWorkspace(
  workspace: Workspace,
  format: OutputFormat,
): Promise<string> {
  return format === "json"
    ? stringifyWorkspaceJson(workspace)
    : stringifyWorkspaceYaml(workspace);
}

function inferOutputFormat(filePath: string): OutputFormat {
  return extname(filePath).toLowerCase() === ".json" ? "json" : "yaml";
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

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isEntrypoint) {
  Promise.resolve(runCli()).then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    (error: unknown) => {
      process.stderr.write(`${formatError(error)}\n`);
      process.exitCode = 1;
    },
  );
}
