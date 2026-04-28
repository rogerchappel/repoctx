import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname } from "node:path";

import type { Workspace } from "../types";
import { writeWorkspaceJson } from "../output/json";
import { normalizeWorkspace } from "./schema";

export async function writeWorkspace(
  filePath: string,
  workspace: Workspace,
): Promise<void> {
  switch (extname(filePath).toLowerCase()) {
    case ".json":
      return writeWorkspaceJson(filePath, workspace);
    case ".yaml":
    case ".yml":
      await mkdir(dirname(filePath), { recursive: true });
      return writeFile(filePath, stringifyWorkspaceForCli(workspace, "yaml"), "utf8");
    default:
      throw new Error(`Unsupported workspace file extension: ${filePath}`);
  }
}

export type WorkspaceFormat = "json" | "yaml";

export function stringifyWorkspaceForCli(
  workspace: Workspace,
  format: WorkspaceFormat,
): string {
  if (format === "json") {
    return `${JSON.stringify(normalizeWorkspace(workspace), null, 2)}\n`;
  }

  return stringifyYaml(normalizeWorkspace(workspace));
}

function stringifyYaml(value: unknown): string {
  const contents = stringifyYamlValue(value, 0).join("\n");
  return contents.endsWith("\n") ? contents : `${contents}\n`;
}

function stringifyYamlValue(value: unknown, indent: number): string[] {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [`${spaces(indent)}[]`];
    }

    return value.flatMap((item) => {
      if (isRecord(item)) {
        return [
          `${spaces(indent)}-`,
          ...stringifyYamlValue(item, indent + 2),
        ];
      }

      return [`${spaces(indent)}- ${formatYamlScalar(item)}`];
    });
  }

  if (!isRecord(value)) {
    return [`${spaces(indent)}${formatYamlScalar(value)}`];
  }

  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
  if (entries.length === 0) {
    return [`${spaces(indent)}{}`];
  }

  return entries.flatMap(([key, entryValue]) => {
    if (isRecord(entryValue)) {
      const nestedEntries = Object.entries(entryValue).filter(([, nested]) => nested !== undefined);
      if (nestedEntries.length === 0) {
        return [`${spaces(indent)}${key}: {}`];
      }

      return [`${spaces(indent)}${key}:`, ...stringifyYamlValue(entryValue, indent + 2)];
    }

    if (Array.isArray(entryValue)) {
      if (entryValue.length === 0) {
        return [`${spaces(indent)}${key}: []`];
      }

      return [`${spaces(indent)}${key}:`, ...stringifyYamlValue(entryValue, indent + 2)];
    }

    return [`${spaces(indent)}${key}: ${formatYamlScalar(entryValue)}`];
  });
}

function formatYamlScalar(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null) {
    return "null";
  }

  throw new Error(`Unsupported YAML value: ${String(value)}`);
}

function spaces(count: number): string {
  return " ".repeat(count);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
