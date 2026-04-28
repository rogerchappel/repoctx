import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { scanWorkspace } from "../../src/scan/scanWorkspace.js";

const execFileAsync = promisify(execFile);
const tempPaths: string[] = [];

async function createTempDir(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "repoctx-workspace-"));
  tempPaths.push(path);
  return path;
}

async function git(repoPath: string, args: string[]): Promise<void> {
  await execFileAsync("git", ["-C", repoPath, ...args]);
}

async function createRepo(repoPath: string): Promise<void> {
  await execFileAsync("git", ["init", "--initial-branch=main", repoPath]);
  await git(repoPath, ["config", "user.email", "repoctx@example.com"]);
  await git(repoPath, ["config", "user.name", "Repoctx Test"]);
  await writeFile(join(repoPath, "README.md"), "# Test\n");
  await git(repoPath, ["add", "README.md"]);
  await git(repoPath, ["commit", "-m", "Initial commit"]);
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("scanWorkspace", () => {
  it("returns discovered repos with practical git metadata and remote-derived names", async () => {
    const root = await createTempDir();
    const repoPath = join(root, "local-folder");

    await createRepo(repoPath);
    await git(repoPath, ["remote", "add", "origin", "git@github.com:example/remote-name.git"]);

    expect(await scanWorkspace(root)).toEqual({
      root,
      repos: [
        {
          name: "remote-name",
          path: repoPath,
          remote: "git@github.com:example/remote-name.git",
          defaultBranch: "main",
          currentBranch: "main",
          status: {
            clean: true,
            status: "clean",
            changedFiles: 0,
          },
        },
      ],
    });
  });

  it("handles repos without remotes using folder names", async () => {
    const root = await createTempDir();
    const repoPath = join(root, "repo-without-remote");

    await createRepo(repoPath);

    expect(await scanWorkspace(root)).toEqual({
      root,
      repos: [
        {
          name: "repo-without-remote",
          path: repoPath,
          remote: null,
          defaultBranch: "main",
          currentBranch: "main",
          status: {
            clean: true,
            status: "clean",
            changedFiles: 0,
          },
        },
      ],
    });
  });
});
