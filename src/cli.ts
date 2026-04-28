#!/usr/bin/env node

import { pathToFileURL } from "node:url";

export interface CliCommand {
  readonly name: string;
  readonly summary: string;
  readonly status: "todo";
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
    status: "todo",
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
    "All commands are placeholders in this scaffold and do not mutate files.",
  ].join("\n");
}

export function runCli(argv = process.argv.slice(2), io: CliIO = process): number {
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
    io.stdout.write([
      `repoctx ${command.name}`,
      "",
      command.summary,
      "",
      "Status: TODO. This placeholder is non-mutating and not implemented yet.",
    ].join("\n") + "\n");
    return 0;
  }

  io.stdout.write(
    `repoctx ${command.name}: TODO placeholder. ${command.summary} No files were changed.\n`,
  );
  return 0;
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isEntrypoint) {
  process.exitCode = runCli();
}
