import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const DEFAULT_IGNORED_DIRECTORIES = new Set([
  ".cache",
  ".git",
  ".next",
  ".turbo",
  ".venv",
  "build",
  "dist",
  "node_modules",
]);

export interface FindGitReposOptions {
  ignoredDirectories?: Iterable<string>;
}

export async function findGitRepos(
  root: string,
  options: FindGitReposOptions = {},
): Promise<string[]> {
  const ignoredDirectories = new Set([
    ...DEFAULT_IGNORED_DIRECTORIES,
    ...(options.ignoredDirectories ?? []),
  ]);
  const repos: string[] = [];
  const rootPath = resolve(root);

  async function walk(directory: string): Promise<void> {
    let entries;

    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    if (entries.some((entry) => entry.name === ".git")) {
      const gitPath = join(directory, ".git");

      try {
        const gitStat = await stat(gitPath);

        if (gitStat.isDirectory() || gitStat.isFile()) {
          repos.push(directory);
          return;
        }
      } catch {
        // Keep walking when a broken .git entry is present.
      }
    }

    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .filter((entry) => !ignoredDirectories.has(entry.name))
        .map((entry) => walk(join(directory, entry.name))),
    );
  }

  await walk(rootPath);

  return repos.sort((left, right) => left.localeCompare(right));
}
