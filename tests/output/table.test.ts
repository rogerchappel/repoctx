import { describe, expect, it } from "vitest";

import { formatTable } from "../../src/output/table";

describe("formatTable", () => {
  it("formats simple table output", () => {
    const table = formatTable(
      [
        { name: "repoctx", type: "oss-cli" },
        { name: "docs", type: "docs-site" },
      ],
      [
        { key: "name", header: "Name" },
        { key: "type", header: "Type" },
      ],
    );

    expect(table).toMatch(/Name\s+Type/);
    expect(table).toMatch(/repoctx\s+oss-cli/);
  });
});
