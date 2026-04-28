import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { runCli } from "../../src/cli";
import type { Workspace } from "../../src/types";

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

async function createWorkspace(workspace: Workspace): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "repoctx-cli-"));
  const file = join(dir, "workspace.json");
  await writeFile(file, `${JSON.stringify(workspace, null, 2)}\n`);
  return file;
}

async function createGitRepo(): Promise<string> {
  const repoPath = await mkdtemp(join(tmpdir(), "repoctx-repo-"));
  await mkdir(join(repoPath, ".git"));
  await writeFile(
    join(repoPath, "package.json"),
    JSON.stringify({ scripts: { test: "vitest", build: "tsup" } }),
  );
  return repoPath;
}

describe("repoctx workspace CLI commands", () => {
  it("validates a workspace and exits zero for warnings only", async () => {
    const repoPath = await createGitRepo();
    const workspaceFile = await createWorkspace({
      repos: {
        app: {
          path: repoPath,
          remote: "https://github.com/example/app.git",
          type: "product",
          commands: {
            test: "npm run test",
          },
        },
      },
    });
    const { io, output } = createIo();

    const exitCode = await runCli(["validate", "--workspace", workspaceFile], io);

    expect(exitCode).toBe(0);
    expect(output().stdout).toContain("Workspace:");
    expect(output().stdout).toContain("Summary: 0 error(s)");
    expect(output().stdout).toContain("default_base missing");
    expect(output().stderr).toBe("");
  });

  it("exits non-zero when validation has errors", async () => {
    const workspaceFile = await createWorkspace({
      repos: {
        missing: {
          path: "/path/that/does/not/exist",
        },
      },
    });
    const { io, output } = createIo();

    const exitCode = await runCli(["validate", "--workspace", workspaceFile], io);

    expect(exitCode).toBe(1);
    expect(output().stdout).toContain("x missing: path does not exist");
  });

  it("inspects one repo context", async () => {
    const repoPath = await createGitRepo();
    const workspaceFile = await createWorkspace({
      defaults: {
        default_base: "main",
        requires_branch: true,
        requires_pr: true,
        review_pack_required: true,
      },
      repos: {
        app: {
          path: repoPath,
          remote: "https://github.com/example/app.git",
          type: "production-saas",
          package_manager: "npm",
          docs_url: "https://example.com/docs",
          commands: {
            build: "npm run build",
            test: "npm run test",
          },
          files: {
            agents: "AGENTS.md",
          },
          integrations: {
            branchbrief: true,
          },
          risk: {
            production_sensitive: true,
            forbidden_by_default: [".env*"],
            high_risk_paths: ["billing/**"],
          },
        },
      },
    });
    const { io, output } = createIo();

    const exitCode = await runCli(["inspect", "app", "--workspace", workspaceFile], io);

    expect(exitCode).toBe(0);
    expect(output().stdout).toContain("Repo: app");
    expect(output().stdout).toContain(`Path: ${repoPath}`);
    expect(output().stdout).toContain("Remote: https://github.com/example/app.git");
    expect(output().stdout).toContain("Production sensitive: yes");
    expect(output().stdout).toContain("Requires PR: yes");
  });

  it("lists repos with type and tag filters", async () => {
    const appPath = await createGitRepo();
    const docsPath = await createGitRepo();
    const workspaceFile = await createWorkspace({
      repos: {
        docs: {
          path: docsPath,
          type: "docs-site",
          tags: ["docs"],
        },
        app: {
          path: appPath,
          type: "product",
          tags: ["client", "web"],
        },
      },
    });
    const { io, output } = createIo();

    const exitCode = await runCli(
      ["list", "--workspace", workspaceFile, "--type", "product", "--tag", "web"],
      io,
    );

    expect(exitCode).toBe(0);
    expect(output().stdout).toContain("Name");
    expect(output().stdout).toContain("app");
    expect(output().stdout).not.toContain("docs-site");
  });

  it("runs doctor with workspace checks", async () => {
    const repoPath = await createGitRepo();
    const workspaceFile = await createWorkspace({
      repos: {
        app: {
          path: repoPath,
          remote: "https://github.com/example/app.git",
          default_base: "main",
        },
      },
    });
    const { io, output } = createIo();

    const exitCode = await runCli(["doctor", "--workspace", workspaceFile], io);

    expect(exitCode).toBe(0);
    expect(output().stdout).toContain("repoctx doctor");
    expect(output().stdout).toContain("workspace file found");
    expect(output().stdout).toContain("Next actions:");
  });
});
