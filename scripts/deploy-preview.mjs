import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

// Workers Build preview deployments do not automatically inherit a Worker-managed
// runtime secret. The Build trigger must provide ADMIN_TOKEN as a masked secret.
// Never commit the token or print it to build logs.
const adminToken = process.env.ADMIN_TOKEN;
if (!adminToken) {
  console.error("ADMIN_TOKEN is required for preview deployment. Configure it as a secret build variable on the Cloudflare preview trigger.");
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), "agrozia-preview-"));
const secretsFile = join(dir, "secrets.json");
await writeFile(secretsFile, JSON.stringify({ ADMIN_TOKEN: adminToken }), { mode: 0o600 });

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
