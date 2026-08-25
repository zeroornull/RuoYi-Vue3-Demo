import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const EXPECTED_PACKAGE_MANAGER = "bun@1.4.0";

const ROUND2_REQUIRED = [
  "vue",
  "vite",
  "@vitejs/plugin-vue",
  "typescript",
  "vue-tsc",
] as const;

const ROUND6_REQUIRED = ["element-plus"] as const;

const ROUND8_REQUIRED = ["axios", "js-cookie", "file-saver"] as const;

const ROUND6_FORBIDDEN = [
  "vue-router",
  "pinia",
  "@element-plus/icons-vue",
] as const;

type PackageJson = {
  private?: boolean;
  type?: string;
  packageManager?: string;
  engines?: { bun?: string; node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  trustedDependencies?: string[];
};

type ParsedVersion = {
  major: number;
  minor: number;
  patch: number;
};

const cwd = process.cwd();
const pkg = JSON.parse(
  readFileSync(resolve(cwd, "package.json"), "utf8"),
) as PackageJson;
const bunVersion = process.versions.bun;
const installed = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
};
const dependencyCount = Object.keys(installed).length;
const hasLockfile = existsSync(resolve(cwd, "bun.lock"));
const systemNodeVersion = readSystemNodeVersion();
const errors: string[] = [];

if (!bunVersion) {
  errors.push("env:check must run on Bun, not Node");
}

if (pkg.packageManager !== EXPECTED_PACKAGE_MANAGER) {
  errors.push(
    `packageManager is ${pkg.packageManager ?? "(missing)"}; expected ${EXPECTED_PACKAGE_MANAGER}`,
  );
}

if (bunVersion && `bun@${bunVersion}` !== pkg.packageManager) {
  errors.push(
    `running Bun ${bunVersion} does not match packageManager ${pkg.packageManager}`,
  );
}

if (pkg.private !== true) {
  errors.push("package.json must set private: true");
}

if (pkg.type !== "module") {
  errors.push('package.json type must be "module"');
}

if (dependencyCount > 0 && !hasLockfile) {
  errors.push("bun.lock is missing; commit the Bun lockfile");
}

if (dependencyCount === 0 && hasLockfile) {
  errors.push(
    "Bun 1.4.0 deletes empty lockfiles; remove bun.lock until the first dependency exists",
  );
}

for (const file of [
  ".env.development",
  ".env.staging",
  ".env.production",
] as const) {
  if (!existsSync(resolve(cwd, file))) {
    errors.push(`missing ${file}`);
  }
}

for (const name of ROUND2_REQUIRED) {
  if (!(name in installed)) {
    errors.push(`round 2 requires dependency ${name}`);
  }
}

for (const name of ROUND6_REQUIRED) {
  if (!(name in installed)) {
    errors.push(`round 6 requires dependency ${name}`);
  }
}

for (const name of ROUND8_REQUIRED) {
  if (!(name in installed)) {
    errors.push(`round 8 requires dependency ${name}`);
  }
}

for (const name of ROUND6_FORBIDDEN) {
  if (name in installed) {
    errors.push(`round 6 forbids dependency ${name}`);
  }
}

if ((pkg.trustedDependencies?.length ?? 0) > 0) {
  errors.push(
    "trustedDependencies must stay empty until a lifecycle script is reviewed",
  );
}

if (!systemNodeVersion) {
  errors.push("system node is missing; keep a Node install for Vite engines");
} else if (!satisfiesViteNodeEngines(systemNodeVersion)) {
  errors.push(
    `system Node ${systemNodeVersion} does not satisfy ^20.19.0 || >=22.12.0`,
  );
}

console.log(
  JSON.stringify(
    {
      cwd,
      bunVersion: bunVersion ?? null,
      bunNodeCompat: bunVersion ? process.version : null,
      systemNodeVersion,
      execPath: process.execPath,
      packageManager: pkg.packageManager ?? null,
      engines: pkg.engines ?? null,
      hasLockfile,
      dependencyCount,
      trustedDependencies: pkg.trustedDependencies ?? [],
    },
    null,
    2,
  ),
);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

function readSystemNodeVersion(): string | null {
  const result = spawnSync("node", ["--version"], { encoding: "utf8" });
  if (result.status !== 0) {
    return null;
  }
  const version = result.stdout.trim();
  return version.length > 0 ? version : null;
}

function parseVersion(raw: string): ParsedVersion | null {
  const match = raw.trim().replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function satisfiesViteNodeEngines(raw: string): boolean {
  const version = parseVersion(raw);
  if (!version) {
    return false;
  }
  if (version.major === 20) {
    return version.minor > 19 || (version.minor === 19 && version.patch >= 0);
  }
  if (version.major === 21) {
    return false;
  }
  if (version.major === 22) {
    return version.minor > 12 || (version.minor === 12 && version.patch >= 0);
  }
  return version.major > 22;
}

