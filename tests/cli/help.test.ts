import { describe, expect, it } from "vitest";

import { COMMANDS, buildHelpText, runCli } from "../../src/cli.js";

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
  it("lists every placeholder command", () => {
    const helpText = buildHelpText();

    expect(helpText).toContain("Usage:");
    for (const command of COMMANDS) {
      expect(helpText).toContain(command.name);
      expect(helpText).toContain(command.summary);
    }
  });

  it("prints help successfully", () => {
    const { io, output } = createIo();

    const exitCode = runCli(["--help"], io);

    expect(exitCode).toBe(0);
    expect(output().stdout).toContain("repoctx <command>");
    expect(output().stderr).toBe("");
  });
});
