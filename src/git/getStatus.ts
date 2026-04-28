import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitStatus {
  clean: boolean;
  status: "clean" | "dirty" | "unknown";
  changedFiles: number;
}

export async function getStatus(repoPath: string): Promise<GitStatus> {
  try {
    const { stdout } = await execFileAsync("git", [
      "-C",
      repoPath,
      "status",
      "--porcelain",
    ]);
    const lines = stdout.split("\n").filter(Boolean);

    return {
      clean: lines.length === 0,
      status: lines.length === 0 ? "clean" : "dirty",
      changedFiles: lines.length,
    };
  } catch {
    return {
      clean: false,
      status: "unknown",
      changedFiles: 0,
    };
  }
}
