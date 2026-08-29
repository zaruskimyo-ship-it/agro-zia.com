import { spawn } from "node:child_process";

// Preview versions use the Worker-managed ADMIN_TOKEN secret already configured
// on Cloudflare. Do not require or duplicate the secret as a build-time variable.
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
