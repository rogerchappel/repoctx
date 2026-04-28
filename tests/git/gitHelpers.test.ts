import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { getCurrentBranch } from "../../src/git/getCurrentBranch.js";
import { getDefaultBranch } from "../../src/git/getDefaultBranch.js";
import {
  getRemote,
  inferRepoName,
  parseGitHubRemote,
} from "../../src/git/getRemote.js";
import { getStatus } from "../../src/git/getStatus.js";

const execFileAsync = promisify(execFile);
const tempPaths: string[] = [];

async function git(repoPath: string, args: string[]): Promise<void> {
  await execFileAsync("git", ["-C", repoPath, ...args]);
}

async function createTempDir(prefix: string): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), prefix));
  tempPaths.push(path);
  return path;
}

async function createRepo(): Promise<string> {
  const repoPath = await createTempDir("repoctx-git-");

  await execFileAsync("git", ["init", "--initial-branch=main", repoPath]);
  await git(repoPath, ["config", "user.email", "repoctx@example.com"]);
  await git(repoPath, ["config", "user.name", "Repoctx Test"]);
  await writeFile(join(repoPath, "README.md"), "# Test\n");
  await git(repoPath, ["add", "README.md"]);
  await git(repoPath, ["commit", "-m", "Initial commit"]);

  return repoPath;
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("git helpers", () => {
  it("detect origin, current branch, default branch, and clean status", async () => {
    const repoPath = await createRepo();

    await git(repoPath, ["remote", "add", "origin", "git@github.com:example/repo.git"]);
    await git(repoPath, [
      "symbolic-ref",
      "refs/remotes/origin/HEAD",
      "refs/remotes/origin/main",
    ]);

    expect(await getRemote(repoPath)).toBe("git@github.com:example/repo.git");
    expect(await getCurrentBranch(repoPath)).toBe("main");
    expect(await getDefaultBranch(repoPath)).toBe("main");
    expect(await getStatus(repoPath)).toEqual({
      clean: true,
      status: "clean",
      changedFiles: 0,
    });
  });

  it("parses supported GitHub remote URL formats for owner and repo names", () => {
    expect(parseGitHubRemote("https://github.com/example/repo.git")).toEqual({
      owner: "example",
      repo: "repo",
    });
    expect(parseGitHubRemote("git@github.com:example/repo.git")).toEqual({
      owner: "example",
      repo: "repo",
    });
    expect(parseGitHubRemote("https://github.com/example/repo/extra")).toBeNull();
    expect(parseGitHubRemote("https://gitlab.com/example/repo.git")).toBeNull();
  });

  it("infers repo names from GitHub remotes before falling back to folder names", () => {
    expect(inferRepoName("/workspace/local-folder", "git@github.com:example/remote-name.git")).toBe(
      "remote-name",
    );
    expect(inferRepoName("/workspace/local-folder", null)).toBe("local-folder");
    expect(inferRepoName("/workspace/local-folder", "ssh://internal/repo.git")).toBe(
      "local-folder",
    );
  });

  it("returns null remote for repos without origin", async () => {
    const repoPath = await createRepo();

    expect(await getRemote(repoPath)).toBeNull();
  });

  it("falls back to master, current branch, then unknown for default branches", async () => {
    const masterRepo = await createTempDir("repoctx-git-");
    const featureRepo = await createTempDir("repoctx-git-");

    await execFileAsync("git", ["init", "--initial-branch=master", masterRepo]);
    expect(await getDefaultBranch(masterRepo)).toBe("master");

    await execFileAsync("git", ["init", "--initial-branch=topic", featureRepo]);
    expect(await getDefaultBranch(featureRepo)).toBe("topic");
    expect(await getDefaultBranch(join(featureRepo, "missing"))).toBe("unknown");
  });

  it("reports dirty files concisely", async () => {
    const repoPath = await createRepo();

    await writeFile(join(repoPath, "README.md"), "# Changed\n");

    expect(await getStatus(repoPath)).toEqual({
      clean: false,
      status: "dirty",
      changedFiles: 1,
    });
  });
});
