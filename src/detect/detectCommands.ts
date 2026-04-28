import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageManager } from "./detectPackageManager.js";

export type CommandName = "test" | "build" | "typecheck" | "lint" | "dev";
export type DetectedCommands = Partial<Record<CommandName, string>>;

const COMMON_SCRIPTS: CommandName[] = ["test", "build", "typecheck", "lint", "dev"];

export function detectCommands(
  repoPath: string,
  packageManager: PackageManager = "unknown",
): DetectedCommands {
  const packageJsonPath = join(repoPath, "package.json");

  if (!existsSync(packageJsonPath)) {
    return {};
  }

  const packageJson = readPackageJson(packageJsonPath);
  const scripts = packageJson?.scripts;

  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) {
    return {};
  }

  const scriptsByName = scripts as Record<string, unknown>;
  const commands: DetectedCommands = {};

  for (const scriptName of COMMON_SCRIPTS) {
    if (typeof scriptsByName[scriptName] === "string") {
      commands[scriptName] = scriptCommand(scriptName, packageManager);
    }
  }

  return commands;
}

function scriptCommand(scriptName: CommandName, packageManager: PackageManager): string {
  const runner = packageManager === "unknown" ? "npm" : packageManager;

  if (runner === "npm") {
    return scriptName === "test" ? "npm test" : `npm run ${scriptName}`;
  }

  return scriptName === "test" ? `${runner} test` : `${runner} run ${scriptName}`;
}

function readPackageJson(packageJsonPath: string): { scripts?: unknown } | null {
  try {
    return JSON.parse(readFileSync(packageJsonPath, "utf8")) as { scripts?: unknown };
  } catch {
    return null;
  }
}
