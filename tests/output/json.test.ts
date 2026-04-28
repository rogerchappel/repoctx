import assert from "node:assert/strict";
import test from "node:test";

import {
  parseWorkspaceJson,
  stringifyWorkspaceJson,
} from "../../src/output/json";

test("round trips workspace JSON", () => {
  const contents = stringifyWorkspaceJson({
    version: "0.1",
    repos: {
      repoctx: {
        path: "/tmp/repoctx",
      },
    },
  });

  const parsed = parseWorkspaceJson(contents);
  assert.equal(parsed.repos.repoctx.path, "/tmp/repoctx");
  assert.match(contents, /"repos"/);
});
