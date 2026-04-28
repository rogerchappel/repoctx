import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { scanWorkspace } from "../../src/scan/scanWorkspace.ts";

const execFileAsync = promisify(execFile);

test("scanWorkspace returns discovered repos with practical git metadata", async () => {
  const root = await mkdtemp(join(tmpdir(), "repoctx-workspace-"));
  const repoPath = join(root, "repo");

  try {
    await execFileAsync("git", ["init", "--initial-branch=main", repoPath]);
    await execFileAsync("git", ["-C", repoPath, "config", "user.email", "repoctx@example.com"]);
    await execFileAsync("git", ["-C", repoPath, "config", "user.name", "Repoctx Test"]);
    await execFileAsync("git", [
      "-C",
      repoPath,
      "remote",
      "add",
      "origin",
      "git@github.com:example/repo.git",
    ]);
    await writeFile(join(repoPath, "README.md"), "# Test\n");
    await execFileAsync("git", ["-C", repoPath, "add", "README.md"]);
    await execFileAsync("git", ["-C", repoPath, "commit", "-m", "Initial commit"]);

    assert.deepEqual(await scanWorkspace(root), {
      root,
      repos: [
        {
          path: repoPath,
          remote: "git@github.com:example/repo.git",
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
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
