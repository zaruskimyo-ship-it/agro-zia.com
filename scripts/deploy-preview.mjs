import { spawn } from "node:child_process";

// Preview versions intentionally inherit the Worker-managed ADMIN_TOKEN secret.
// Runtime secrets are configured in Cloudflare Workers > Settings > Variables & Secrets
// and must not be exposed to the build environment.
const command = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(command, ["wrangler", "versions", "upload"], {
  stdio: "inherit",
  env: process.env,
});

const exitCode = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("close", (code) => resolve(code ?? 1));
});

process.exit(exitCode);
