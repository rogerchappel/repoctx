import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { getCurrentBranch } from "../../src/git/getCurrentBranch.ts";
import { getDefaultBranch } from "../../src/git/getDefaultBranch.ts";
import { getRemote } from "../../src/git/getRemote.ts";
import { getStatus } from "../../src/git/getStatus.ts";

const execFileAsync = promisify(execFile);

async function git(repoPath, args) {
  await execFileAsync("git", ["-C", repoPath, ...args]);
}

async function createRepo() {
  const repoPath = await mkdtemp(join(tmpdir(), "repoctx-git-"));

  await execFileAsync("git", ["init", "--initial-branch=main", repoPath]);
  await git(repoPath, ["config", "user.email", "repoctx@example.com"]);
  await git(repoPath, ["config", "user.name", "Repoctx Test"]);
  await writeFile(join(repoPath, "README.md"), "# Test\n");
  await git(repoPath, ["add", "README.md"]);
  await git(repoPath, ["commit", "-m", "Initial commit"]);

  return repoPath;
}

test("git helpers detect origin, current branch, default branch, and clean status", async () => {
  const repoPath = await createRepo();

  try {
    await git(repoPath, ["remote", "add", "origin", "git@github.com:example/repo.git"]);
    await git(repoPath, [
      "symbolic-ref",
      "refs/remotes/origin/HEAD",
      "refs/remotes/origin/main",
    ]);

    assert.equal(await getRemote(repoPath), "git@github.com:example/repo.git");
    assert.equal(await getCurrentBranch(repoPath), "main");
    assert.equal(await getDefaultBranch(repoPath), "main");
    assert.deepEqual(await getStatus(repoPath), {
      clean: true,
      status: "clean",
      changedFiles: 0,
    });
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("getDefaultBranch falls back to master, current branch, then unknown", async () => {
  const masterRepo = await mkdtemp(join(tmpdir(), "repoctx-git-"));
  const featureRepo = await mkdtemp(join(tmpdir(), "repoctx-git-"));

  try {
    await execFileAsync("git", ["init", "--initial-branch=master", masterRepo]);
    assert.equal(await getDefaultBranch(masterRepo), "master");

    await execFileAsync("git", ["init", "--initial-branch=topic", featureRepo]);
    assert.equal(await getDefaultBranch(featureRepo), "topic");
    assert.equal(await getDefaultBranch(join(featureRepo, "missing")), "unknown");
  } finally {
    await rm(masterRepo, { recursive: true, force: true });
    await rm(featureRepo, { recursive: true, force: true });
  }
});

test("getStatus reports dirty files concisely", async () => {
  const repoPath = await createRepo();

  try {
    await writeFile(join(repoPath, "README.md"), "# Changed\n");

    assert.deepEqual(await getStatus(repoPath), {
      clean: false,
      status: "dirty",
      changedFiles: 1,
    });
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});
