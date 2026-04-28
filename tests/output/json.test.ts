import { describe, expect, it } from "vitest";

import {
  parseWorkspaceJson,
  stringifyWorkspaceJson,
} from "../../src/output/json";

describe("workspace JSON output", () => {
  it("round trips workspace JSON", () => {
    const contents = stringifyWorkspaceJson({
      version: "0.1",
      repos: {
        repoctx: {
          path: "/tmp/repoctx",
        },
      },
    });

    const parsed = parseWorkspaceJson(contents);
    expect(parsed.repos.repoctx.path).toBe("/tmp/repoctx");
    expect(contents).toMatch(/"repos"/);
  });
});
