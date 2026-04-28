#!/usr/bin/env node

import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stringifyWorkspaceJson } from "./output/json";
import { stringifyWorkspaceYaml } from "./output/yaml";
import { scanWorkspace } from "./scan/scanWorkspace";
import type { Workspace } from "./types";
import { loadWorkspace } from "./workspace/loadWorkspace";
import { mergeWorkspace } from "./workspace/mergeWorkspace";
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
    status: "todo",
  },
  {
    name: "validate",
    summary: "Validate repoctx configuration and context inputs.",
    status: "todo",
  },
  {
    name: "export",
    summary: "Export repository context for downstream tools.",
    status: "todo",
  },
  {
    name: "doctor",
    summary: "Run environment and repository health checks.",
    status: "todo",
  },
  {
    name: "list",
    summary: "List configured repoctx entries.",
    status: "todo",
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
    "  -h, --help     Show help.",
    "  -v, --version  Show version.",
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
    if (command.name === "scan") {
      io.stdout.write(`${buildScanHelpText()}\n`);
      return 0;
    }

    io.stdout.write([
      `repoctx ${command.name}`,
      "",
      command.summary,
      "",
      "Status: TODO. This placeholder is non-mutating and not implemented yet.",
    ].join("\n") + "\n");
    return 0;
  }

  if (command.name === "scan") {
    return runScanCommand(args, io);
  }

  io.stdout.write(
    `repoctx ${command.name}: TODO placeholder. ${command.summary} No files were changed.\n`,
  );
  return 0;
}

function buildScanHelpText(): string {
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

type OutputFormat = "yaml" | "json";

interface ScanOptions {
  path: string;
  workspaceFile: string;
  outputFile: string;
  outputFormat: OutputFormat;
}

async function runScanCommand(args: string[], io: CliIO): Promise<number> {
  let options: ParsedScanOptions;

  try {
    options = parseScanOptions(args);
  } catch (error) {
    io.stderr.write(`${formatError(error)}\n\n${buildScanHelpText()}\n`);
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

interface ParsedScanOptions extends ScanOptions {
  formatWasExplicit: boolean;
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
      outputFile = requireOptionValue(args, index, arg);
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

function requireOptionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (!value || (value.startsWith("-") && value !== "-")) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
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
