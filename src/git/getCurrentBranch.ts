import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(repoPath: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repoPath, ...args]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

export async function getCurrentBranch(repoPath: string): Promise<string | null> {
  return (
    (await git(repoPath, ["branch", "--show-current"])) ??
    (await git(repoPath, ["symbolic-ref", "--quiet", "--short", "HEAD"]))
  );
}
