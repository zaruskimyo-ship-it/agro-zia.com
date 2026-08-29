import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const token = process.env.ADMIN_TOKEN;
if (!token) {
  console.error("ADMIN_TOKEN build secret is not configured.");
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), "agrozia-secrets-"));
const secretsFile = join(dir, "secrets.json");
await writeFile(secretsFile, JSON.stringify({ ADMIN_TOKEN: token }), { mode: 0o600 });

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["wrangler", "versions", "upload", "--secrets-file", secretsFile], {
  stdio: "inherit",
  env: process.env,
});

const exitCode = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("close", (code) => resolve(code ?? 1));
});

await rm(dir, { recursive: true, force: true });
process.exit(exitCode);
