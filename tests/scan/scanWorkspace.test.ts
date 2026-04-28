import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { test } from "vitest";
import { scanWorkspace } from "../../src/scan/scanWorkspace.js";

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
    await writeFile(join(repoPath, "package.json"), JSON.stringify({
      scripts: {
        test: "node --test",
        build: "tsc",
      },
    }));
    await writeFile(join(repoPath, "package-lock.json"), "{}\n");
    await writeFile(join(repoPath, "AGENTS.md"), "# Agents\n");
    await writeFile(join(repoPath, "BRANCH_BRIEF.md"), "# Branch Brief\n");
    await mkdir(join(repoPath, "ignored", ".git"), { recursive: true });
    await execFileAsync("git", ["-C", repoPath, "add", "README.md"]);
    await execFileAsync("git", ["-C", repoPath, "commit", "-m", "Initial commit"]);

    const scan = await scanWorkspace(root);

    assert.equal(scan.root, root);
    assert.equal(scan.repos.length, 1);
    assert.deepEqual(scan.repos[0], {
      name: "repo",
      path: repoPath,
      remote: "git@github.com:example/repo.git",
      defaultBranch: "main",
      currentBranch: "main",
      status: {
        clean: false,
        status: "dirty",
        changedFiles: 4,
      },
      metadata: {
        packageManager: "npm",
        commands: {
          test: "npm test",
          build: "npm run build",
        },
        type: "unknown",
        docs: {
          readme: true,
          docsDirectory: false,
          astroConfig: false,
          contentDocs: false,
          wranglerConfig: false,
          paths: ["README.md"],
        },
        agents: {
          agentsMd: true,
          claudeMd: false,
          copilotInstructions: false,
          paths: ["AGENTS.md"],
        },
        branchbrief: {
          workflow: false,
          brief: true,
          enabled: true,
          paths: ["BRANCH_BRIEF.md"],
        },
      },
    });
    assert.deepEqual(scan.workspaceRepos.repo, {
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
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
