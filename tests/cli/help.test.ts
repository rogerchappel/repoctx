import { symlinkSync } from "node:fs";
import { mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import packageJson from "../../package.json";
import { COMMANDS, buildHelpText, isCliEntrypoint, runCli } from "../../src/cli.js";

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

describe("repoctx help", () => {
  it("recognizes path aliases and symlinks as the CLI entrypoint", async () => {
    const directory = await mkdtemp(join(tmpdir(), "repoctx-entrypoint-"));
    const modulePath = resolve("src/cli.ts");
    const moduleRealPath = await realpath(modulePath);
    const symlinkPath = join(directory, "cli.ts");
    symlinkSync(modulePath, symlinkPath);

    expect(isCliEntrypoint(pathToFileURL(moduleRealPath).href, symlinkPath)).toBe(true);
    expect(isCliEntrypoint(pathToFileURL(moduleRealPath).href, undefined)).toBe(false);
  });

  it("lists every placeholder command", () => {
    const helpText = buildHelpText();

    expect(helpText).toContain("Usage:");
    for (const command of COMMANDS) {
      expect(helpText).toContain(command.name);
      expect(helpText).toContain(command.summary);
    }
  });

  it("prints help successfully", async () => {
    const { io, output } = createIo();

    const exitCode = await runCli(["--help"], io);

    expect(exitCode).toBe(0);
    expect(output().stdout).toContain("repoctx <command>");
    expect(output().stderr).toBe("");
  });

  it("prints the package version", async () => {
    const { io, output } = createIo();

    const exitCode = await runCli(["--version"], io);

    expect(exitCode).toBe(0);
    expect(output().stdout).toBe(`${packageJson.version}\n`);
    expect(output().stderr).toBe("");
  });
});
