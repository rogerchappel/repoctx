import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { detectAgentInstructions } from "../../src/detect/detectAgentInstructions.js";
import { detectBranchbrief } from "../../src/detect/detectBranchbrief.js";
import { detectCommands } from "../../src/detect/detectCommands.js";
import { detectDocs } from "../../src/detect/detectDocs.js";
import { detectPackageManager } from "../../src/detect/detectPackageManager.js";
import { detectProjectType } from "../../src/detect/detectProjectType.js";
import { detectRepoMetadata } from "../../src/scan/detectRepoMetadata.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesPath = join(__dirname, "../fixtures/detect");

function fixture(name: string): string {
  return join(fixturesPath, name);
}

describe("repository metadata detectors", () => {
  it("detects package managers from lockfiles", () => {
    assert.equal(detectPackageManager(fixture("repo-pnpm-docs")), "pnpm");
    assert.equal(detectPackageManager(fixture("repo-npm-app")), "npm");
    assert.equal(detectPackageManager(fixture("repo-yarn-cli")), "yarn");
    assert.equal(detectPackageManager(fixture("repo-bun")), "bun");
    assert.equal(detectPackageManager(fixture("repo-empty")), "unknown");
  });

  it("maps common package scripts through the detected package manager", () => {
    assert.deepEqual(detectCommands(fixture("repo-pnpm-docs"), "pnpm"), {
      test: "pnpm test",
      build: "pnpm run build",
      typecheck: "pnpm run typecheck",
      lint: "pnpm run lint",
      dev: "pnpm run dev",
    });

    assert.deepEqual(detectCommands(fixture("repo-npm-app"), "npm"), {
      test: "npm test",
      build: "npm run build",
    });
  });

  it("uses conservative project type heuristics", () => {
    assert.equal(detectProjectType(fixture("repo-pnpm-docs")), "docs-site");
    assert.equal(detectProjectType(fixture("repo-yarn-cli")), "oss-cli");
    assert.equal(detectProjectType(fixture("repo-github-action")), "github-action");
    assert.equal(detectProjectType(fixture("repo-template")), "template");
    assert.equal(detectProjectType(fixture("repo-npm-app")), "product/web-app");
    assert.equal(detectProjectType(fixture("repo-cloudflare")), "cloudflare-deployable");
    assert.equal(detectProjectType(fixture("repo-empty")), "unknown");
  });

  it("detects docs, agent instructions, and branchbrief files", () => {
    assert.deepEqual(detectDocs(fixture("repo-pnpm-docs")), {
      readme: true,
      docsDirectory: true,
      astroConfig: true,
      contentDocs: true,
      wranglerConfig: false,
      paths: ["README.md", "docs", "astro.config.mjs", "src/content/docs"],
    });

    assert.deepEqual(detectAgentInstructions(fixture("repo-agent")), {
      agentsMd: true,
      claudeMd: true,
      copilotInstructions: true,
      paths: ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md"],
    });

    assert.deepEqual(detectBranchbrief(fixture("repo-branchbrief")), {
      workflow: true,
      brief: true,
      enabled: true,
      paths: [".github/workflows/branchbrief.yml", "BRANCH_BRIEF.md"],
    });
  });

  it("composes repository metadata", () => {
    assert.deepEqual(detectRepoMetadata(fixture("repo-pnpm-docs")), {
      packageManager: "pnpm",
      commands: {
        test: "pnpm test",
        build: "pnpm run build",
        typecheck: "pnpm run typecheck",
        lint: "pnpm run lint",
        dev: "pnpm run dev",
      },
      type: "docs-site",
      docs: {
        readme: true,
        docsDirectory: true,
        astroConfig: true,
        contentDocs: true,
        wranglerConfig: false,
        paths: ["README.md", "docs", "astro.config.mjs", "src/content/docs"],
      },
      agents: {
        agentsMd: false,
        claudeMd: false,
        copilotInstructions: false,
        paths: [],
      },
      branchbrief: {
        workflow: false,
        brief: false,
        enabled: false,
        paths: [],
      },
    });
  });
});
