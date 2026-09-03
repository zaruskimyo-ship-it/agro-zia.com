import fs from "node:fs";

const worker = fs.readFileSync(new URL("../_worker.js", import.meta.url), "utf8");
const attachmentUi = fs.readFileSync(new URL("../locales/stage4-attachment.js", import.meta.url), "utf8");
const inquiryHandler = fs.readFileSync(new URL("../locales/stage1-inquiry-root-fix.js", import.meta.url), "utf8");
const inquiryPage = fs.readFileSync(new URL("../inquiry.html", import.meta.url), "utf8");

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
  if (!worker.includes(`"${type}"`) || !attachmentUi.includes(`'${type}'`)) {
    throw new Error(`Attachment contract failed: missing MIME type ${type}`);
  }
}

for (const ext of expectedExtensions) {
  if (!new RegExp(`\\.${ext}`, "i").test(worker) || !new RegExp(`\\.${ext}`, "i").test(attachmentUi)) {
    throw new Error(`Attachment contract failed: missing extension .${ext}`);
  }
}

for (const source of [worker, attachmentUi]) {
  if (!source.includes("1024 * 1024")) throw new Error("Attachment contract failed: 1 MiB limit missing");
}

for (const needle of [
  "requestBody.append('attachment', attachment, attachment.name)",
  "fetch('/api/inquiries'",
  "credentials: 'same-origin'",
]) {
  if (!inquiryHandler.includes(needle)) throw new Error(`Inquiry contract failed: ${needle}`);
}

for (const needle of [
  "locales/stage4-attachment.js",
  "locales/stage1-inquiry-root-fix.js",
]) {
  if (!inquiryPage.includes(needle)) {
    throw new Error(`Inquiry page contract failed: ${needle} is not loaded`);
  }
}

if (!worker.includes("inquiries/${requestNumber}/")) {
  throw new Error("Attachment contract failed: request-scoped R2 key missing");
}
if (!worker.includes("sendDocument")) throw new Error("Attachment contract failed: Telegram document delivery missing");
if (!worker.includes("email_notification")) throw new Error("Attachment contract failed: email notification status missing");

console.log("Telegram-11 attachment contract checks: PASS");
