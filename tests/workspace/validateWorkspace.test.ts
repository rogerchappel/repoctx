import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { validateWorkspace } from "../../src/workspace/validateWorkspace";

const tempPaths: string[] = [];

async function createRepoFixture(packageJson: unknown): Promise<string> {
  const repoPath = await mkdtemp(join(tmpdir(), "repoctx-"));
  tempPaths.push(repoPath);
  await mkdir(join(repoPath, ".git"));
  await writeFile(join(repoPath, "package.json"), JSON.stringify(packageJson));
  return repoPath;
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

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
    const repoPath = await createRepoFixture({ scripts: { build: "tsc" } });

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

  it("validates package commands against declared package scripts", async () => {
    const repoPath = await createRepoFixture({
      scripts: {
        build: "tsc",
        test: "vitest run",
      },
    });

    const result = await validateWorkspace({
      repos: {
        library: {
          path: repoPath,
          commands: {
            build: "npm run build",
            test: "npm test",
            install: "npm ci",
            lint: "pnpm run lint",
          },
        },
      },
    });

    expect(result.valid).toBe(true);
    expect(
      result.issues.some((issue) =>
        issue.message.includes("missing package script: lint"),
      ),
    ).toBe(true);
    expect(
      result.issues.some((issue) =>
        issue.message.includes("missing package script: test"),
      ),
    ).toBe(false);
    expect(
      result.issues.some((issue) =>
        issue.message.includes("missing package script: ci"),
      ),
    ).toBe(false);
  });
});
