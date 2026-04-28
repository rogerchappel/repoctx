import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { Workspace } from "../types";
import { assertWorkspace, normalizeWorkspace } from "../workspace/schema";

export function stringifyWorkspaceJson(workspace: Workspace): string {
  return `${JSON.stringify(normalizeWorkspace(workspace), null, 2)}\n`;
}

export function parseWorkspaceJson(contents: string): Workspace {
  return assertWorkspace(JSON.parse(contents));
}

export async function readWorkspaceJson(filePath: string): Promise<Workspace> {
  return parseWorkspaceJson(await readFile(filePath, "utf8"));
}

export async function writeWorkspaceJson(
  filePath: string,
  workspace: Workspace,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, stringifyWorkspaceJson(workspace), "utf8");
}
