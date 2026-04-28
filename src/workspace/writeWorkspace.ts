import { extname } from "node:path";

import type { Workspace } from "../types";
import { writeWorkspaceJson } from "../output/json";
import { writeWorkspaceYaml } from "../output/yaml";

export async function writeWorkspace(
  filePath: string,
  workspace: Workspace,
): Promise<void> {
  switch (extname(filePath).toLowerCase()) {
    case ".json":
      return writeWorkspaceJson(filePath, workspace);
    case ".yaml":
    case ".yml":
      return writeWorkspaceYaml(filePath, workspace);
    default:
      throw new Error(`Unsupported workspace file extension: ${filePath}`);
  }
}
