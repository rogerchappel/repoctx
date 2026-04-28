import { execFile } from "node:child_process";
import { basename } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface ParsedGitHubRemote {
  owner: string;
  repo: string;
}

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

export function parseGitHubRemote(remote: string): ParsedGitHubRemote | null {
  const trimmed = remote.trim();
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
    };
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== "github.com") {
      return null;
    }

    const pathParts = url.pathname
      .replace(/^\/+/, "")
      .replace(/\.git$/, "")
      .split("/");
    const [owner, repo] = pathParts;

    if (pathParts.length !== 2 || !owner || !repo) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

export function inferRepoName(repoPath: string, remote: string | null): string {
  if (remote) {
    const parsedRemote = parseGitHubRemote(remote);
    if (parsedRemote) {
      return parsedRemote.repo;
    }
  }

  return basename(repoPath);
}
