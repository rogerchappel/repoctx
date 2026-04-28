import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

import { runCli } from "../../src/cli.js";
import { parseWorkspaceJson } from "../../src/output/json.js";

const execFileAsync = promisify(execFile);

function createIo() {
  let stdout = "";
  let stderr = "";

  return {
    io: {
      stdout: {
        write(chunk: string) {
          stdout += chunk;
          return true;
        },
      },
      stderr: {
        write(chunk: string) {
          stderr += chunk;
          return true;
        },
      },
    },
    output() {
      return { stdout, stderr };
    },
  };
}

describe("repoctx scan", () => {
  it("merges discovered git repos into an existing workspace file", async () => {
    const root = await mkdtemp(join(tmpdir(), "repoctx-cli-scan-"));
    const repoPath = join(root, "repo");
    const workspaceFile = join(root, "workspace.json");

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
      await execFileAsync("git", ["-C", repoPath, "add", "README.md"]);
      await execFileAsync("git", ["-C", repoPath, "commit", "-m", "Initial commit"]);
      await writeFile(
        workspaceFile,
        JSON.stringify({
          version: "0.1",
          repos: {
            repo: {
              path: repoPath,
              notes: "keep this",
              commands: {
                test: "npm test -- --watch=false",
              },
            },
          },
        }),
      );

      const { io, output } = createIo();
      const exitCode = await runCli([
        "scan",
        root,
        "--workspace",
        workspaceFile,
        "--format",
        "json",
      ], io);

      expect(exitCode).toBe(0);
      expect(output().stderr).toBe("");
      expect(output().stdout).toContain("Scanned 1 repos");

      const workspace = parseWorkspaceJson(await readFile(workspaceFile, "utf8"));
      expect(workspace.repos.repo).toMatchObject({
        path: repoPath,
        remote: "git@github.com:example/repo.git",
        default_base: "main",
        package_manager: "npm",
        notes: "keep this",
        commands: {
          test: "npm test -- --watch=false",
          build: "npm run build",
        },
        files: {
          readme: "README.md",
        },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("prints formatted workspace output without writing when output is stdout", async () => {
    const root = await mkdtemp(join(tmpdir(), "repoctx-cli-scan-"));
    const repoPath = join(root, "repo");

    try {
      await execFileAsync("git", ["init", "--initial-branch=main", repoPath]);

      const { io, output } = createIo();
      const exitCode = await runCli([
        "scan",
        root,
        "--output",
        "-",
        "--format",
        "json",
      ], io);

      expect(exitCode).toBe(0);
      expect(output().stderr).toBe("");
      const workspace = parseWorkspaceJson(output().stdout);
      expect(workspace.repos.repo.path).toBe(repoPath);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
