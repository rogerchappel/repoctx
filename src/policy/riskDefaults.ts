import type { RepoType, WorkspaceRiskPolicy } from "../types";

export const defaultForbiddenPaths = [".env*", "secrets/**", "credentials/**"];

export const defaultHighRiskPaths = [
  "auth/**",
  "billing/**",
  "migrations/**",
  "production/**",
];

export const defaultMediumRiskPaths = [
  ".github/workflows/**",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
];

export const productionSensitiveRepoTypes: RepoType[] = [
  "product",
  "production-saas",
  "company",
  "client",
];

export function defaultRiskPolicyForType(type: RepoType = "unknown"): WorkspaceRiskPolicy {
  const productionSensitive = productionSensitiveRepoTypes.includes(type);

  return {
    production_sensitive: productionSensitive,
    forbidden_by_default: productionSensitive
      ? [...defaultForbiddenPaths, "production/**"]
      : [...defaultForbiddenPaths],
    high_risk_paths: productionSensitive ? [...defaultHighRiskPaths] : [],
    medium_risk_paths: [...defaultMediumRiskPaths],
  };
}
