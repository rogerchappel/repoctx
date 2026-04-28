import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { Workspace } from "../types";
import { assertWorkspace, normalizeWorkspace } from "../workspace/schema";

interface YamlPackage {
  parse(contents: string): unknown;
  stringify(value: unknown): string;
}

export async function parseWorkspaceYaml(contents: string): Promise<Workspace> {
  const yaml = await loadYamlPackage();
  return assertWorkspace(yaml.parse(contents));
}

export async function stringifyWorkspaceYaml(
  workspace: Workspace,
): Promise<string> {
  const yaml = await loadYamlPackage();
  const contents = yaml.stringify(normalizeWorkspace(workspace));
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

async function loadYamlPackage(): Promise<YamlPackage> {
  try {
    const importer = Function(
      "specifier",
      "return import(specifier)",
    ) as (specifier: string) => Promise<YamlPackage>;
    return await importer("yaml");
  } catch (error) {
    const cause = error instanceof Error ? `: ${error.message}` : "";
    throw new Error(
      `YAML support requires the optional "yaml" package to be installed${cause}`,
    );
  }
}
