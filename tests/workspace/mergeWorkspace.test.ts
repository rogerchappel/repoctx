import { describe, expect, it } from "vitest";

import { mergeWorkspace } from "../../src/workspace/mergeWorkspace";

describe("mergeWorkspace", () => {
  it("merges discovered repos without deleting manual fields", () => {
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

    expect(merged.repos.app.path).toBe("/old/app");
    expect(merged.repos.app.remote).toBe("git@github.com:example/app.git");
    expect(merged.repos.app.type).toBe("product");
    expect(merged.repos.app.notes).toBe("manual note");
    expect(merged.repos.app.commands?.test).toBe("npm test");
    expect(merged.repos.app.commands?.build).toBe("npm run build");
    expect(merged.repos.app.risk?.high_risk_paths).toEqual(["billing/**"]);
    expect(merged.repos.app.risk?.forbidden_by_default).toEqual([".env*"]);
    expect(merged.repos.docs.path).toBe("/new/docs");
  });
});
