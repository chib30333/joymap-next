// Applies the Prisma schema at server start-up, tolerating an unreachable database.
//
// This used to run during the build (`prisma db push` in the build script), which
// coupled every deploy to database availability: when the free Render Postgres
// instance expired, the build failed with P1001 and no code could ship at all,
// including changes that had nothing to do with the database. Running it at start
// instead lets builds succeed independently, and the schema syncs on the next boot
// once the database is reachable again.
//
// A failure here is logged but never fatal. The obvious alternative — chaining
// `prisma db push && next start` — would turn a database outage into a total
// outage, because the server would refuse to boot and even the prerendered pages
// would stop serving. Starting with a stale or missing schema degrades far more
// gracefully: only the routes that actually query the database error out.
//
// Invoking the CLI's entry point directly (rather than via `npx`) keeps this
// working on hosts with no network access to the npm registry at boot.

import { spawnSync } from "node:child_process";
import { join } from "node:path";

const prismaCli = join(process.cwd(), "node_modules", "prisma", "build", "index.js");

const res = spawnSync(
  process.execPath,
  [prismaCli, "db", "push", "--skip-generate"],
  { cwd: process.cwd(), stdio: "inherit" },
);

if (res.status !== 0) {
  console.warn(
    "\n[db-push] Schema sync failed — starting the server anyway. " +
      "Routes that query the database will error until it is reachable.",
  );
}

// Always succeed so the `&& next start` chain proceeds.
process.exit(0);
