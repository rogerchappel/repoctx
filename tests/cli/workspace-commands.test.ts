import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../src/cli.js";
import { loadWorkspace } from "../../src/workspace/loadWorkspace.js";

function createIo(cwd?: string) {
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
      cwdPath: cwd,
    },
    output() {
      return { stdout, stderr };
    },
  };
}

async function runInTemp(args: string[]) {
  const cwd = await mkdtemp(join(tmpdir(), "repoctx-cli-"));
  const result = await runWithCwd(cwd, args);

  return { cwd, ...result };
}

describe("repoctx workspace commands", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("initializes workspace.yaml and refuses to overwrite without --force", async () => {
    const first = await runInTemp(["init"]);
    tempDirs.push(first.cwd);

    expect(first.exitCode).toBe(0);
    expect(await loadWorkspace(join(first.cwd, "workspace.yaml"))).toEqual({
      version: "0.1",
      repos: {},
    });

    const second = await runInTemp(["init"]);
    tempDirs.push(second.cwd);
    await writeFile(join(second.cwd, "workspace.yaml"), "version: '0.1'\nrepos: {}\n");

    const retry = await runWithCwd(second.cwd, ["init"]);

    expect(retry.exitCode).toBe(1);
    expect(retry.stderr).toContain("already exists");
  });

  it("supports custom init output and --force", async () => {
    const first = await runInTemp(["init", "--output", "repoctx.yaml"]);
    tempDirs.push(first.cwd);

    await writeFile(join(first.cwd, "repoctx.yaml"), "stale: true\n");
    const forced = await runWithCwd(first.cwd, ["init", "--output", "repoctx.yaml", "--force"]);

    expect(forced.exitCode).toBe(0);
    expect(await loadWorkspace(join(first.cwd, "repoctx.yaml"))).toEqual({
      version: "0.1",
      repos: {},
    });
  });

  it("adds, updates, and removes repository entries", async () => {
    const context = await runInTemp(["init"]);
    tempDirs.push(context.cwd);

    const add = await runWithCwd(context.cwd, [
      "add",
      "repoctx",
      "--path",
      "../repoctx",
      "--remote",
      "git@example.com:repoctx.git",
      "--type",
      "oss-cli",
      "--tag",
      "cli",
    ]);

    expect(add.exitCode).toBe(0);
    let workspace = await loadWorkspace(join(context.cwd, "workspace.yaml"));
    expect(workspace.repos.repoctx).toEqual({
      path: "../repoctx",
      remote: "git@example.com:repoctx.git",
      type: "oss-cli",
      tags: ["cli"],
    });

    const update = await runWithCwd(context.cwd, [
      "update",
      "repoctx",
      "--path",
      ".",
      "--default-base",
      "main",
      "--docs-url",
      "https://example.com/docs",
      "--tag",
      "cli",
      "--tag",
      "workspace",
    ]);

    expect(update.exitCode).toBe(0);
    workspace = await loadWorkspace(join(context.cwd, "workspace.yaml"));
    expect(workspace.repos.repoctx).toEqual({
      path: ".",
      remote: "git@example.com:repoctx.git",
      type: "oss-cli",
      default_base: "main",
      docs_url: "https://example.com/docs",
      tags: ["cli", "workspace"],
    });

    const remove = await runWithCwd(context.cwd, ["remove", "repoctx"]);

    expect(remove.exitCode).toBe(0);
    workspace = await loadWorkspace(join(context.cwd, "workspace.yaml"));
    expect(workspace.repos).toEqual({});
  });

  it("uses explicit workspace before candidate workspace files", async () => {
    const context = await runInTemp(["init", "--output", "repoctx.yaml"]);
    tempDirs.push(context.cwd);
    await runWithCwd(context.cwd, ["init", "--output", "workspace.yaml"]);

    const add = await runWithCwd(context.cwd, [
      "add",
      "custom",
      "--path",
      ".",
      "--workspace",
      "repoctx.yaml",
    ]);

    expect(add.exitCode).toBe(0);
    expect((await loadWorkspace(join(context.cwd, "repoctx.yaml"))).repos.custom?.path).toBe(".");
    expect((await loadWorkspace(join(context.cwd, "workspace.yaml"))).repos.custom).toBeUndefined();
  });

  it("uses workspace.yaml before other implicit workspace candidates", async () => {
    const context = await runInTemp(["init", "--output", "repoctx.yaml"]);
    tempDirs.push(context.cwd);
    await runWithCwd(context.cwd, ["init", "--output", "workspace.yaml"]);

    const add = await runWithCwd(context.cwd, ["add", "default", "--path", "."]);

    expect(add.exitCode).toBe(0);
    expect((await loadWorkspace(join(context.cwd, "workspace.yaml"))).repos.default?.path).toBe(".");
    expect((await loadWorkspace(join(context.cwd, "repoctx.yaml"))).repos.default).toBeUndefined();
  });

  it("exports workspace as JSON to stdout and YAML to a file", async () => {
    const context = await runInTemp(["init"]);
    tempDirs.push(context.cwd);
    await runWithCwd(context.cwd, ["add", "repoctx", "--path", "."]);

    const json = await runWithCwd(context.cwd, ["export", "--format", "json"]);
    expect(json.exitCode).toBe(0);
    expect(JSON.parse(json.stdout).repos.repoctx.path).toBe(".");

    const yaml = await runWithCwd(context.cwd, [
      "export",
      "--format",
      "yaml",
      "--output",
      "exports/workspace.yaml",
    ]);
    expect(yaml.exitCode).toBe(0);
    expect(await readFile(join(context.cwd, "exports/workspace.yaml"), "utf8")).toContain("repoctx");
  });

  it("returns non-zero for invalid mutation input", async () => {
    const context = await runInTemp(["init"]);
    tempDirs.push(context.cwd);

    expect((await runWithCwd(context.cwd, ["add", "repoctx"])).exitCode).toBe(1);
    expect((await runWithCwd(context.cwd, ["remove", "missing"])).stderr).toContain("not found");
    expect((await runWithCwd(context.cwd, ["update", "repoctx"])).exitCode).toBe(1);
    expect((await runWithCwd(context.cwd, ["export", "--format", "xml"])).exitCode).toBe(1);
  });
});

async function runWithCwd(cwd: string, args: string[]) {
  const { io, output } = createIo(cwd);

  const exitCode = await runCli(args, io);
  return { exitCode, ...output() };
}
