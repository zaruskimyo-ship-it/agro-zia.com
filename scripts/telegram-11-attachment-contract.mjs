import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const worker = read("../_worker.js");
const rootPage = read("../inquiry.html");
const rootHandler = read("../inquiry-ux.js");
const canonicalHandler = read("../locales/stage1-inquiry-root-fix.js");
const attachmentUi = read("../locales/stage4-attachment.js");

const expectedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const expectedExtensions = ["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "webp"];

for (const type of expectedTypes) {
  if (!worker.includes(`"${type}"`) || !attachmentUi.includes(`'${type}'`) || !rootHandler.includes(`'${type}'`)) {
    throw new Error(`Attachment contract failed: missing MIME type ${type}`);
  }
}

for (const ext of expectedExtensions) {
  if (!new RegExp(`\\.${ext}`, "i").test(worker) || !new RegExp(`\\.${ext}`, "i").test(attachmentUi) || !new RegExp(`\\.${ext}`, "i").test(rootHandler)) {
    throw new Error(`Attachment contract failed: missing extension .${ext}`);
  }
}

for (const source of [worker, attachmentUi, rootHandler]) {
  if (!source.includes("1024 * 1024")) throw new Error("Attachment contract failed: 1 MiB limit missing");
}

for (const [source, needles] of [
  [rootHandler, ["fetch('/api/inquiries'", "body.append('attachment', attachment, attachment.name)"]],
  [canonicalHandler, ["fetch('/api/inquiries'", "requestBody.append('attachment', attachment, attachment.name)"]],
]) {
  for (const needle of needles) if (!source.includes(needle)) throw new Error(`Inquiry contract failed: ${needle}`);
}

if (!rootPage.includes('<script src="/inquiry-ux.js"></script>')) {
  throw new Error("Inquiry page contract failed: root handler is not loaded");
}
if (!worker.includes("inquiries/${requestNumber}/")) throw new Error("Attachment contract failed: request-scoped R2 key missing");
if (!worker.includes("sendDocument")) throw new Error("Attachment contract failed: Telegram document delivery missing");
if (!worker.includes("email_notification")) throw new Error("Attachment contract failed: email notification status missing");

console.log("Telegram-11 attachment contract checks: PASS");
