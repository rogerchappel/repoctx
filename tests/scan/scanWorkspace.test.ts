import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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

    const scan = await scanWorkspace(root);

    expect(scan.root).toBe(root);
    expect(scan.repos).toHaveLength(1);
    expect(scan.repos[0]).toMatchObject({
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
    });
    expect(scan.workspaceRepos["remote-name"]).toMatchObject({
      path: repoPath,
      remote: "git@github.com:example/remote-name.git",
      default_base: "main",
    });
  });

  it("handles repos without remotes using folder names", async () => {
    const root = await createTempDir();
    const repoPath = join(root, "repo-without-remote");

    await createRepo(repoPath);

    const scan = await scanWorkspace(root);

    expect(scan.repos).toHaveLength(1);
    expect(scan.repos[0]).toMatchObject({
      name: "repo-without-remote",
      path: repoPath,
      remote: null,
      defaultBranch: "main",
      currentBranch: "main",
    });
    expect(scan.workspaceRepos["repo-without-remote"]).toMatchObject({
      path: repoPath,
      default_base: "main",
    });
  });

  it("projects detector metadata into workspace entries", async () => {
    const root = await createTempDir();
    const repoPath = join(root, "repo");

    await createRepo(repoPath);
    await git(repoPath, ["remote", "add", "origin", "git@github.com:example/repo.git"]);
    await writeFile(
      join(repoPath, "package.json"),
      JSON.stringify({
        scripts: {
          test: "node --test",
          build: "tsc",
        },
      }),
    );
    await writeFile(join(repoPath, "package-lock.json"), "{}\n");
    await writeFile(join(repoPath, "AGENTS.md"), "# Agents\n");
    await writeFile(join(repoPath, "BRANCH_BRIEF.md"), "# Branch Brief\n");
    await mkdir(join(repoPath, "ignored", ".git"), { recursive: true });

    const scan = await scanWorkspace(root);

    expect(scan.workspaceRepos.repo).toEqual({
      path: repoPath,
      remote: "git@github.com:example/repo.git",
      default_base: "main",
      type: "unknown",
      package_manager: "npm",
      commands: {
        test: "npm test",
        build: "npm run build",
      },
      files: {
        readme: "README.md",
        agents: "AGENTS.md",
        branchbrief: "BRANCH_BRIEF.md",
      },
      integrations: {
        branchbrief: true,
      },
    });
  });
});
