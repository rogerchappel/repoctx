import assert from "node:assert/strict";
import test from "node:test";

import {
  assertWorkspace,
  isRepoType,
  workspaceSchema,
} from "../../src/workspace/schema";

test("validates minimum workspace shape", () => {
  const workspace = assertWorkspace({
    repos: {
      repoctx: {
        path: "/tmp/repoctx",
      },
    },
  });

  assert.equal(workspace.repos.repoctx.path, "/tmp/repoctx");
});

test("rejects invalid repo types", () => {
  const result = workspaceSchema.safeParse({
    repos: {
      repoctx: {
        path: "/tmp/repoctx",
        type: "website",
      },
    },
  });

  assert.equal(result.success, false);
});

test("recognizes supported repo types", () => {
  assert.equal(isRepoType("oss-cli"), true);
  assert.equal(isRepoType("website"), false);
});
