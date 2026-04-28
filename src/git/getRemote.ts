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

export async function getRemote(repoPath: string): Promise<string | null> {
  return git(repoPath, ["config", "--get", "remote.origin.url"]);
}
