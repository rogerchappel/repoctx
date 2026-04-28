import { readFile } from "node:fs/promises";
import { extname } from "node:path";

import type { Workspace } from "../types";
import { readWorkspaceJson } from "../output/json";
import { assertWorkspace } from "./schema";

export async function loadWorkspace(filePath: string): Promise<Workspace> {
  switch (extname(filePath).toLowerCase()) {
    case ".json":
      return readWorkspaceJson(filePath);
    case ".yaml":
    case ".yml":
      return assertWorkspace(parseYamlSubset(await readFile(filePath, "utf8")));
    default:
      throw new Error(`Unsupported workspace file extension: ${filePath}`);
  }
}

interface ParsedLine {
  readonly indent: number;
  readonly key?: string;
  readonly value?: string;
  readonly arrayValue?: string;
}

function parseYamlSubset(contents: string): unknown {
  const lines = contents
    .split(/\r?\n/)
    .map(parseLine)
    .filter((line): line is ParsedLine => line !== undefined);
  const [value] = parseBlock(lines, 0, 0);
  return value;
}

function parseBlock(
  lines: ParsedLine[],
  start: number,
  indent: number,
): [unknown, number] {
  if (lines[start]?.arrayValue !== undefined) {
    return parseArray(lines, start, indent);
  }

  return parseObject(lines, start, indent);
}

function parseObject(
  lines: ParsedLine[],
  start: number,
  indent: number,
): [Record<string, unknown>, number] {
  const object: Record<string, unknown> = {};
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) {
      break;
    }

    if (line.indent > indent) {
      throw new Error(`Invalid YAML indentation near line ${index + 1}.`);
    }

    if (!line.key) {
      throw new Error(`Expected YAML mapping near line ${index + 1}.`);
    }

    if (line.value !== undefined) {
      object[line.key] = parseScalar(line.value);
      index += 1;
      continue;
    }

    const next = lines[index + 1];
    if (!next || next.indent <= line.indent) {
      object[line.key] = {};
      index += 1;
      continue;
    }

    const [nested, nextIndex] = parseBlock(lines, index + 1, next.indent);
    object[line.key] = nested;
    index = nextIndex;
  }

  return [object, index];
}

function parseArray(
  lines: ParsedLine[],
  start: number,
  indent: number,
): [unknown[], number] {
  const array: unknown[] = [];
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) {
      break;
    }

    if (line.indent > indent || line.arrayValue === undefined) {
      throw new Error(`Invalid YAML array near line ${index + 1}.`);
    }

    if (line.arrayValue.length > 0) {
      array.push(parseScalar(line.arrayValue));
      index += 1;
      continue;
    }

    const next = lines[index + 1];
    if (!next || next.indent <= line.indent) {
      array.push({});
      index += 1;
      continue;
    }

    const [nested, nextIndex] = parseBlock(lines, index + 1, next.indent);
    array.push(nested);
    index = nextIndex;
  }

  return [array, index];
}

function parseLine(line: string): ParsedLine | undefined {
  const withoutComment = line.trimStart().startsWith("#") ? "" : line;
  if (withoutComment.trim().length === 0) {
    return undefined;
  }

  const indent = withoutComment.length - withoutComment.trimStart().length;
  const trimmed = withoutComment.trim();

  if (trimmed.startsWith("-")) {
    return { indent, arrayValue: trimmed.slice(1).trim() };
  }

  const separator = trimmed.indexOf(":");
  if (separator === -1) {
    throw new Error(`Invalid YAML line: ${line}`);
  }

  const key = trimmed.slice(0, separator).trim();
  const value = trimmed.slice(separator + 1).trim();
  return value.length > 0 ? { indent, key, value } : { indent, key };
}

function parseScalar(value: string): unknown {
  if (value === "{}") {
    return {};
  }

  if (value === "[]") {
    return [];
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  if (
    value.startsWith("\"") && value.endsWith("\"")
  ) {
    return JSON.parse(value);
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  return value;
}
