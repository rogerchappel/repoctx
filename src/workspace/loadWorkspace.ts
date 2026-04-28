import { extname } from "node:path";

import type { Workspace } from "../types";
import { readWorkspaceJson } from "../output/json";
import { readWorkspaceYaml } from "../output/yaml";

export async function loadWorkspace(filePath: string): Promise<Workspace> {
  switch (extname(filePath).toLowerCase()) {
    case ".json":
      return readWorkspaceJson(filePath);
    case ".yaml":
    case ".yml":
      return readWorkspaceYaml(filePath);
    default:
      throw new Error(`Unsupported workspace file extension: ${filePath}`);
  }
}
