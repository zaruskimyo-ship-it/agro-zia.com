import test from "node:test";
import assert from "node:assert/strict";

const allowedRoles = ["admin", "manager", "operator"];
const mutationRoles = ["admin", "manager"];

function canRead(role) { return allowedRoles.includes(role); }
function canMutate(role) { return mutationRoles.includes(role); }

function publicProduct(product) {
  const { password_hash, password_salt, token, ...safe } = product;
  return safe;
}

test("admin product read authorization allows Store admin roles only", () => {
  assert.equal(canRead("admin"), true);
  assert.equal(canRead("manager"), true);
  assert.equal(canRead("operator"), true);
  assert.equal(canRead("customer"), false);
});

test("admin product mutation authorization excludes operator", () => {
  assert.equal(canMutate("admin"), true);
  assert.equal(canMutate("manager"), true);
  assert.equal(canMutate("operator"), false);
});

test("admin product projection contains no credential or session secret", () => {
  const projected = publicProduct({ id: "p1", name: "NPK", password_hash: "x", password_salt: "y", token: "z" });
  assert.equal(projected.id, "p1");
  assert.equal("password_hash" in projected, false);
  assert.equal("password_salt" in projected, false);
  assert.equal("token" in projected, false);
});
