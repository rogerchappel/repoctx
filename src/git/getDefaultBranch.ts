import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getCurrentBranch } from "./getCurrentBranch.ts";

const execFileAsync = promisify(execFile);

async function git(repoPath: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repoPath, ...args]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function hasLocalBranch(repoPath: string, branch: string): Promise<boolean> {
  try {
    await execFileAsync("git", [
      "-C",
      repoPath,
      "show-ref",
      "--verify",
      "--quiet",
      `refs/heads/${branch}`,
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function getDefaultBranch(repoPath: string): Promise<string> {
  const originHead = await git(repoPath, [
    "symbolic-ref",
    "--quiet",
    "--short",
    "refs/remotes/origin/HEAD",
  ]);

  if (originHead?.startsWith("origin/")) {
    return originHead.slice("origin/".length);
  }

  if (await hasLocalBranch(repoPath, "main")) {
    return "main";
  }

  if (await hasLocalBranch(repoPath, "master")) {
    return "master";
  }

  return (await getCurrentBranch(repoPath)) ?? "unknown";
}
