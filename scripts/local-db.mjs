/**
 * Local development database. The dev machine's network blocks the Postgres
 * wire protocol to Supabase, so `npm run db:local` runs a real Postgres 18
 * (embedded-postgres) on 127.0.0.1:55432 instead. Point .env.local at it:
 *
 *   DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/xclsv"
 *   DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:55432/xclsv"
 *
 * Data persists in %LOCALAPPDATA%\xclsv\pgdata (NTFS — deliberately NOT the
 * FAT32 project drive). Ctrl+C stops the server cleanly.
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const PORT = 55432;
const appDataRoot = path.join(
  process.env.LOCALAPPDATA ?? os.homedir(),
  "xclsv",
);
const dataDir = path.join(appDataRoot, "pgdata");

// This machine has no system-wide Visual C++ runtime, which the Postgres
// binaries need (exit 0xC0000135 without it). A copy is stashed in
// %LOCALAPPDATA%\xclsv\vcredist; restore it into the binaries folder after
// every npm install wipes node_modules.
if (process.platform === "win32") {
  const require = createRequire(import.meta.url);
  const binDir = path.join(
    path.dirname(require.resolve("@embedded-postgres/windows-x64/package.json")),
    "native",
    "bin",
  );
  const stash = path.join(appDataRoot, "vcredist");
  if (!fs.existsSync(path.join(binDir, "msvcp140.dll")) && fs.existsSync(stash)) {
    for (const dll of fs.readdirSync(stash)) {
      fs.copyFileSync(path.join(stash, dll), path.join(binDir, dll));
    }
    console.log("restored VC++ runtime DLLs into embedded-postgres binaries");
  }
}

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

const firstRun = !fs.existsSync(path.join(dataDir, "PG_VERSION"));

if (firstRun) {
  console.log(`initialising cluster at ${dataDir} …`);
  await pg.initialise();
}

await pg.start();

if (firstRun) {
  await pg.createDatabase("xclsv");
}

console.log(`local postgres ready on 127.0.0.1:${PORT} (database: xclsv)`);
console.log("press Ctrl+C to stop");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await pg.stop();
    process.exit(0);
  });
}
