import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { parse, stringify } from "yaml";

import type { Workspace } from "../types";
import { assertWorkspace, normalizeWorkspace } from "../workspace/schema";

export async function parseWorkspaceYaml(contents: string): Promise<Workspace> {
  return assertWorkspace(parse(contents));
}

export async function stringifyWorkspaceYaml(
  workspace: Workspace,
): Promise<string> {
  const contents = stringify(normalizeWorkspace(workspace));
  return contents.endsWith("\n") ? contents : `${contents}\n`;
}

export async function readWorkspaceYaml(filePath: string): Promise<Workspace> {
  return parseWorkspaceYaml(await readFile(filePath, "utf8"));
}

export async function writeWorkspaceYaml(
  filePath: string,
  workspace: Workspace,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, await stringifyWorkspaceYaml(workspace), "utf8");
}
