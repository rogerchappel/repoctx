import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findGitRepos } from "../../src/scan/findGitRepos.js";

const tempPaths: string[] = [];

async function createTempDir(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "repoctx-scan-"));
  tempPaths.push(path);
  return path;
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("findGitRepos", () => {
  it("discovers .git directories and files", async () => {
    const root = await createTempDir();

    await mkdir(join(root, "app", ".git"), { recursive: true });
    await mkdir(join(root, "worktree"), { recursive: true });
    await writeFile(join(root, "worktree", ".git"), "gitdir: ../.git/worktrees/worktree\n");

    expect(await findGitRepos(root)).toEqual([join(root, "app"), join(root, "worktree")]);
  });

  it("ignores heavy folders and nested .git internals", async () => {
    const root = await createTempDir();

    await mkdir(join(root, "node_modules", "dependency", ".git"), { recursive: true });
    await mkdir(join(root, "dist", "generated", ".git"), { recursive: true });
    await mkdir(join(root, ".venv", "dependency", ".git"), { recursive: true });
    await mkdir(join(root, ".next", "generated", ".git"), { recursive: true });
    await mkdir(join(root, ".turbo", "generated", ".git"), { recursive: true });
    await mkdir(join(root, ".cache", "generated", ".git"), { recursive: true });
    await mkdir(join(root, "build", "generated", ".git"), { recursive: true });
    await mkdir(join(root, "repo", ".git", "modules", "nested", ".git"), {
      recursive: true,
    });

    expect(await findGitRepos(root)).toEqual([join(root, "repo")]);
  });

  it("does not descend into discovered repos with nested Git repositories", async () => {
    const root = await createTempDir();

    await mkdir(join(root, "parent", ".git"), { recursive: true });
    await mkdir(join(root, "parent", "vendor", "child", ".git"), { recursive: true });

    expect(await findGitRepos(root)).toEqual([join(root, "parent")]);
  });

  it("returns an empty list for missing or unreadable paths", async () => {
    const root = await createTempDir();

    expect(await findGitRepos(join(root, "missing"))).toEqual([]);
  });

  it("respects caller-provided ignored directories", async () => {
    const root = await createTempDir();

    await mkdir(join(root, "fixture-cache", "repo", ".git"), { recursive: true });
    await mkdir(join(root, "included", ".git"), { recursive: true });

    expect(await findGitRepos(root, { ignoredDirectories: ["fixture-cache"] })).toEqual([
      join(root, "included"),
    ]);
  });
});
