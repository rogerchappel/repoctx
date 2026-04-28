import { access } from "node:fs/promises";
import { resolve } from "node:path";

export const WORKSPACE_FILE_CANDIDATES = [
  "workspace.yaml",
  "repoctx.yaml",
  "repos.yaml",
] as const;

export async function findWorkspaceFile(
  explicitPath?: string,
  cwd = process.cwd(),
): Promise<string | undefined> {
  if (explicitPath) {
    return resolve(cwd, explicitPath);
  }

  for (const candidate of WORKSPACE_FILE_CANDIDATES) {
    const filePath = resolve(cwd, candidate);
    if (await pathExists(filePath)) {
      return filePath;
    }
  }

  return undefined;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
