import assert from "node:assert/strict";
import test from "node:test";

import { mergeWorkspace } from "../../src/workspace/mergeWorkspace";

test("merges discovered repos without deleting manual fields", () => {
  const merged = mergeWorkspace(
    {
      version: "0.1",
      repos: {
        app: {
          path: "/old/app",
          type: "product",
          notes: "manual note",
          commands: {
            test: "npm test",
          },
          risk: {
            production_sensitive: true,
            high_risk_paths: ["billing/**"],
          },
        },
      },
    },
    {
      app: {
        path: "/new/app",
        remote: "git@github.com:example/app.git",
        type: "unknown",
        commands: {
          build: "npm run build",
          test: "npm run test:detected",
        },
        risk: {
          production_sensitive: false,
          forbidden_by_default: [".env*"],
        },
      },
      docs: {
        path: "/new/docs",
        type: "docs-site",
      },
    },
  );

  assert.equal(merged.repos.app.path, "/old/app");
  assert.equal(merged.repos.app.remote, "git@github.com:example/app.git");
  assert.equal(merged.repos.app.type, "product");
  assert.equal(merged.repos.app.notes, "manual note");
  assert.equal(merged.repos.app.commands?.test, "npm test");
  assert.equal(merged.repos.app.commands?.build, "npm run build");
  assert.deepEqual(merged.repos.app.risk?.high_risk_paths, ["billing/**"]);
  assert.deepEqual(merged.repos.app.risk?.forbidden_by_default, [".env*"]);
  assert.equal(merged.repos.docs.path, "/new/docs");
});
