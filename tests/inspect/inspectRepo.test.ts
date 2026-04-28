import { describe, expect, it } from "vitest";

import { inspectRepo } from "../../src/inspect/inspectRepo";

describe("inspectRepo", () => {
  it("formats repo context with defaults", () => {
    const output = inspectRepo(
      {
        defaults: {
          default_base: "main",
          requires_branch: true,
          requires_pr: true,
          review_pack_required: true,
        },
        repos: {
          repoctx: {
            path: "/tmp/repoctx",
            remote: "https://github.com/rogerchappel/repoctx.git",
            type: "oss-cli",
            package_manager: "npm",
            commands: {
              test: "npm test",
            },
            files: {
              agents: "AGENTS.md",
              readme: "README.md",
            },
            integrations: {
              branchbrief: true,
            },
          },
        },
      },
      "repoctx",
    );

    expect(output).toContain("Repo: repoctx");
    expect(output).toContain("Base: main");
    expect(output).toContain("- test: npm test");
    expect(output).toContain("AGENTS: AGENTS.md");
    expect(output).toContain("Branchbrief: yes");
    expect(output).toContain("Requires branch: yes");
  });

  it("throws for an unknown repo", () => {
    expect(() => inspectRepo({ repos: {} }, "missing")).toThrow("Unknown repo");
  });
});
