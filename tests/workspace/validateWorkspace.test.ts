import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { validateWorkspace } from "../../src/workspace/validateWorkspace";

describe("validateWorkspace", () => {
  it("reports missing paths as errors", async () => {
    const result = await validateWorkspace({
      repos: {
        missing: {
          path: "/path/that/does/not/exist",
        },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.issues[0].message).toMatch(/path does not exist/);
  });

  it("warns on missing metadata and production-sensitive policy gaps", async () => {
    const repoPath = await mkdtemp(join(tmpdir(), "repoctx-"));
    await mkdir(join(repoPath, ".git"));
    await writeFile(
      join(repoPath, "package.json"),
      JSON.stringify({ scripts: { build: "tsc" } }),
    );

    const result = await validateWorkspace({
      repos: {
        product: {
          path: repoPath,
          type: "product",
          docs_url: "not-a-url",
          commands: {
            build: "npm run build",
            test: "npm run missing",
          },
          risk: {
            production_sensitive: true,
          },
          agents: {
            requires_branch: false,
            review_pack_required: false,
          },
        },
      },
    });

    expect(result.valid).toBe(true);
    expect(
      result.issues.some((issue) => issue.message === "default_base missing"),
    ).toBe(true);
    expect(result.issues.some((issue) => issue.message === "remote missing")).toBe(
      true,
    );
    expect(result.issues.some((issue) => issue.message.includes("docs_url"))).toBe(
      true,
    );
    expect(
      result.issues.some((issue) =>
        issue.message.includes("no high_risk_paths configured"),
      ),
    ).toBe(true);
    expect(
      result.issues.some((issue) =>
        issue.message.includes("missing package script: missing"),
      ),
    ).toBe(true);
  });
});
