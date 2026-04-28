import { describe, expect, it } from "vitest";

import {
  assertWorkspace,
  isRepoType,
  workspaceSchema,
} from "../../src/workspace/schema";

describe("workspaceSchema", () => {
  it("validates minimum workspace shape", () => {
    const workspace = assertWorkspace({
      repos: {
        repoctx: {
          path: "/tmp/repoctx",
        },
      },
    });

    expect(workspace.repos.repoctx.path).toBe("/tmp/repoctx");
  });

  it("rejects invalid repo types", () => {
    const result = workspaceSchema.safeParse({
      repos: {
        repoctx: {
          path: "/tmp/repoctx",
          type: "website",
        },
      },
    });

    expect(result.success).toBe(false);
  });

  it("recognizes supported repo types", () => {
    expect(isRepoType("oss-cli")).toBe(true);
    expect(isRepoType("website")).toBe(false);
  });
});
