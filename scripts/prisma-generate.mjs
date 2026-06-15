// Resilient `prisma generate` wrapper.
//
// On Windows, `prisma generate` intermittently dies with:
//   EBUSY: resource busy or locked, rename '...query_engine-windows.dll.node.tmpXXXX'
//          -> '...query_engine-windows.dll.node'
//
// Root cause: Windows Defender's real-time minifilter (WdFilter) scans every
// freshly written executable (.dll.node is a native DLL) the instant its handle
// closes, briefly locking the file exactly when Prisma renames its temp engine
// into place. The lock releases within tens of milliseconds. On policy-managed
// machines, Defender path exclusions are not honored and Tamper Protection blocks
// turning real-time protection off, so we can't reliably stop the scan — we make
// the engine placement tolerate it instead.
//
// Key facts this relies on:
//   * Prisma writes the JS client (index.js / index.d.ts / package.json) BEFORE
//     copying the engine binary, so a run that fails only on the engine rename has
//     already produced a correct, up-to-date JS client.
//   * The engine binary is a fixed, version-pinned artifact shipped in both
//     node_modules/@prisma/engines and node_modules/prisma — byte-identical to what
//     `generate` would have placed. We finish the job with a retrying copy.
//
// On any non-EBUSY-engine failure (e.g. a real schema error) we propagate the
// original exit code unchanged, so this never masks a genuine problem.

import { spawnSync } from "node:child_process";
import { existsSync, copyFileSync, statSync, rmSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const isWin = process.platform === "win32";
const ENGINE = "query_engine-windows.dll.node";

const prismaCli = join(root, "node_modules", "prisma", "build", "index.js");
const clientDir = join(root, "node_modules", ".prisma", "client");
const dest = join(clientDir, ENGINE);
const engineSources = [
  join(root, "node_modules", "@prisma", "engines", ENGINE),
  join(root, "node_modules", "prisma", ENGINE),
];

function sleep(ms) {
  // Synchronous sleep with no dependencies — keeps the script linear/simple.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runGenerate() {
  const res = spawnSync(process.execPath, [prismaCli, "generate"], {
    cwd: root,
    stdio: ["inherit", "inherit", "pipe"],
    encoding: "utf8",
  });
  const stderr = res.stderr || "";
  if (stderr) process.stderr.write(stderr);
  return { code: res.status ?? 1, stderr };
}

function isEngineRenameLock(stderr) {
  return /EBUSY[\s\S]*query_engine[\s\S]*\.dll\.node/i.test(stderr);
}

function cleanLeftoverTemps() {
  try {
    for (const f of readdirSync(clientDir)) {
      if (f.startsWith(`${ENGINE}.tmp`)) {
        try { rmSync(join(clientDir, f), { force: true }); } catch {}
      }
    }
  } catch {}
}

function placeEngineWithRetry() {
  const src = engineSources.find(existsSync);
  if (!src) return false;
  // Engine already correct? Nothing to do.
  if (existsSync(dest) && statSync(dest).size === statSync(src).size) return true;
  mkdirSync(dirname(dest), { recursive: true });
  for (let i = 0; i < 60; i++) {
    try {
      copyFileSync(src, dest);
      return true;
    } catch {
      sleep(100); // wait out the transient scan-on-close lock, then retry
    }
  }
  return false;
}

// First attempt, plus one quick retry in case the rename simply missed the scan window.
let { code, stderr } = runGenerate();
if (code !== 0 && isWin && isEngineRenameLock(stderr)) {
  cleanLeftoverTemps();
  ({ code, stderr } = runGenerate());
}

if (code === 0) {
  cleanLeftoverTemps();
  process.exit(0);
}

// Only work around the one specific, known-benign Windows failure.
if (isWin && isEngineRenameLock(stderr)) {
  const ok = placeEngineWithRetry();
  cleanLeftoverTemps();
  if (ok && existsSync(dest)) {
    console.log(
      "\n[prisma-generate] Worked around Windows Defender engine-rename lock: " +
        "JS client generated; query engine placed via resilient copy."
    );
    process.exit(0);
  }
}

// Genuine failure (or we couldn't place the engine) — surface it.
process.exit(code || 1);
