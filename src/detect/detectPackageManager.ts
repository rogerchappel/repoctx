import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun" | "unknown";

const LOCKFILES: Array<{ file: string; packageManager: PackageManager }> = [
  { file: "pnpm-lock.yaml", packageManager: "pnpm" },
  { file: "package-lock.json", packageManager: "npm" },
  { file: "yarn.lock", packageManager: "yarn" },
  { file: "bun.lockb", packageManager: "bun" },
];

export function detectPackageManager(repoPath: string): PackageManager {
  for (const lockfile of LOCKFILES) {
    if (existsSync(join(repoPath, lockfile.file))) {
      return lockfile.packageManager;
    }
  }

  return "unknown";
}
