import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import { validateWorkspace } from "../../src/workspace/validateWorkspace";

test("reports missing paths as errors", async () => {
  const result = await validateWorkspace({
    repos: {
      missing: {
        path: "/path/that/does/not/exist",
      },
    },
  });

  assert.equal(result.valid, false);
  assert.match(result.issues[0].message, /path does not exist/);
});

test("warns on missing metadata and production-sensitive policy gaps", async () => {
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

  assert.equal(result.valid, true);
  assert(result.issues.some((issue) => issue.message === "default_base missing"));
  assert(result.issues.some((issue) => issue.message === "remote missing"));
  assert(result.issues.some((issue) => issue.message.includes("docs_url")));
  assert(
    result.issues.some((issue) =>
      issue.message.includes("no high_risk_paths configured"),
    ),
  );
  assert(
    result.issues.some((issue) =>
      issue.message.includes("missing package script: missing"),
    ),
  );
});
