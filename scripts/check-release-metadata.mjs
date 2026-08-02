import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const lockfile = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const expected = manifest.version;

const versions = {
  "package-lock.json": lockfile.version,
  "package-lock.json root package": lockfile.packages?.[""]?.version,
  "built CLI": execFileSync(process.execPath, [join(root, "dist/cli.js"), "--version"], {
    encoding: "utf8",
  }).trim(),
};

const [pack] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: root, encoding: "utf8" }),
);
versions["npm pack"] = pack.version;

const mismatches = Object.entries(versions).filter(([, version]) => version !== expected);
if (mismatches.length > 0) {
  for (const [source, version] of mismatches) {
    console.error(`${source} reports ${JSON.stringify(version)}; expected ${expected}`);
  }
  process.exit(1);
}

const escaped = expected.replaceAll(".", "\\.");
if (!new RegExp(`^## \\[${escaped}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m").test(changelog)) {
  console.error(`CHANGELOG.md has no dated ${expected} release heading`);
  process.exit(1);
}
if (!changelog.includes(`compare/v0.1.4...v${expected}`)) {
  console.error(`CHANGELOG.md has no comparison link ending at v${expected}`);
  process.exit(1);
}

console.log(`release metadata agrees on ${expected}`);
