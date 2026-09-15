import { strict as assert } from "node:assert";
import { validateRegistrationInput, normalizeEmail } from "../src/auth/customer-contract.js";

assert.equal(normalizeEmail("  BUYER@Example.COM "), "buyer@example.com");

assert.equal(validateRegistrationInput({
  email: "buyer@example.com",
  password: "1234567890",
  name: "Buyer"
}).ok, true);

assert.equal(validateRegistrationInput({
  email: "buyer@example.com",
  password: "short",
  name: "Buyer"
}).error, "invalid_password");

assert.equal(validateRegistrationInput({
  email: "not-an-email",
  password: "1234567890",
  name: "Buyer"
}).error, "invalid_email");

assert.equal(validateRegistrationInput({
  email: "buyer@example.com",
  password: "1234567890",
  name: ""
}).error, "invalid_name");

console.log("customer identity contract tests: PASS");
