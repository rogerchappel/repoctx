import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findGitRepos } from "../../src/scan/findGitRepos.ts";

test("findGitRepos discovers .git directories and files", async () => {
  const root = await mkdtemp(join(tmpdir(), "repoctx-scan-"));

  try {
    await mkdir(join(root, "app", ".git"), { recursive: true });
    await mkdir(join(root, "worktree"), { recursive: true });
    await writeFile(join(root, "worktree", ".git"), "gitdir: ../.git/worktrees/worktree\n");

    assert.deepEqual(await findGitRepos(root), [
      join(root, "app"),
      join(root, "worktree"),
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("findGitRepos ignores heavy folders and nested .git internals", async () => {
  const root = await mkdtemp(join(tmpdir(), "repoctx-scan-"));

  try {
    await mkdir(join(root, "node_modules", "dependency", ".git"), { recursive: true });
    await mkdir(join(root, "dist", "generated", ".git"), { recursive: true });
    await mkdir(join(root, "repo", ".git", "modules", "nested", ".git"), {
      recursive: true,
    });

    assert.deepEqual(await findGitRepos(root), [join(root, "repo")]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
