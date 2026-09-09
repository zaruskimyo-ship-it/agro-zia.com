(() => {
  const form = document.getElementById("customer-login");
  const emailStep = document.getElementById("step-email");
  const codeStep = document.getElementById("step-code");
  const result = document.getElementById("login-result");
  const codeInput = form.querySelector('[name="code"]');
  let email = "";
  const next = new URLSearchParams(location.search).get("next") || "/zarus-workspace.html";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/zarus-workspace.html";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    email = form.querySelector('[name="email"]').value.trim().toLowerCase();
    result.textContent = "Sending sign-in code…";
    try {
      const r = await fetch("/api/customer/login/request", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify({ email }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "login_request_failed");
      emailStep.hidden = true; codeStep.hidden = false; codeInput.focus(); result.textContent = "If this email can sign in, a one-time code has been sent.";
    } catch (_) { result.textContent = "We could not send the sign-in code. Please try again."; }
  });
  document.getElementById("verify").addEventListener("click", async () => {
    const code = codeInput.value.trim();
    result.textContent = "Verifying…";
    try {
      const r = await fetch("/api/customer/login/verify", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify({ email, code }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "invalid_code");
      location.href = safeNext;
    } catch (_) { result.textContent = "The code is invalid or expired. Please request a new code."; }
  });
  document.getElementById("back").addEventListener("click", () => { emailStep.hidden = false; codeStep.hidden = true; result.textContent = ""; codeInput.value = ""; });
})();
