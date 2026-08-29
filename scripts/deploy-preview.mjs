import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

// Workers Builds does not copy a Worker runtime secret into the preview-build
// process. The preview trigger therefore supplies ADMIN_TOKEN as a masked
// build-time secret, and this script passes it to Wrangler as the preview
// Worker's runtime secret without ever printing it.
const adminToken = process.env.ADMIN_TOKEN;
if (!adminToken) {
  console.error(
    "ADMIN_TOKEN is required for preview deployment. Configure ADMIN_TOKEN as a secret build variable on the Cloudflare preview trigger.",
  );
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), "agrozia-preview-"));
const secretsFile = join(dir, "secrets.json");

try {
  await writeFile(
    secretsFile,
    JSON.stringify({ ADMIN_TOKEN: adminToken }),
    { mode: 0o600 },
  );

  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawn(
    command,
    ["wrangler", "versions", "upload", "--secrets-file", secretsFile],
    {
      stdio: "inherit",
      env: process.env,
    },
  );

  const exitCode = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });

  process.exitCode = exitCode;
} finally {
  await rm(dir, { recursive: true, force: true });
}
