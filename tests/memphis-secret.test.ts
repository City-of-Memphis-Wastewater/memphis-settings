import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MemphisSecret } from "../src/index.ts";

test("MemphisSecret: initialization is explicit", (t) => {
  const appDir = mkdtempSync(path.join(os.tmpdir(), "memphis-secret-test-"));
  t.after(() => rmSync(appDir, { recursive: true, force: true }));

  const secret = new MemphisSecret({ appDir });

  assert.equal(secret.isInitialized(), false);

  secret.initializeVault();

  assert.equal(secret.isInitialized(), true);
});

test("MemphisSecret: CRUD and overwrite behavior", (t) => {
  const appDir = mkdtempSync(path.join(os.tmpdir(), "memphis-secret-test-"));
  t.after(() => rmSync(appDir, { recursive: true, force: true }));

  const secret = new MemphisSecret({ appDir });
  secret.initializeVault();

  secret.setValue("eds", "username", "operator");
  secret.setValue("eds", "password", "test-secret");

  assert.equal(secret.value("eds", "username"), "operator");
  assert.equal(secret.value("eds", "password"), "test-secret");

  assert.deepEqual(secret.list(), [
    { service: "eds", item: "password" },
    { service: "eds", item: "username" },
  ]);

  secret.setValue("eds", "password", "replacement", {
    overwrite: false,
  });
  assert.equal(secret.value("eds", "password"), "test-secret");

  secret.setValue("eds", "password", "replacement", {
    overwrite: true,
  });
  assert.equal(secret.value("eds", "password"), "replacement");

  assert.equal(secret.remove("eds", "password"), true);
  assert.equal(secret.value("eds", "password"), undefined);
  assert.equal(secret.remove("eds", "password"), false);
});
