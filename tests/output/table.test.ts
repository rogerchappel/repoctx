import assert from "node:assert/strict";
import test from "node:test";

import { formatTable } from "../../src/output/table";

test("formats simple table output", () => {
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

  assert.match(table, /Name\s+Type/);
  assert.match(table, /repoctx\s+oss-cli/);
});
