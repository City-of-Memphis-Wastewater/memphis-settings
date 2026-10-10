import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MemphisEnv } from "../src/index.ts";

test("MemphisEnv: CRUD, overwrite behavior, and persistence", (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "memphis-env-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const env = new MemphisEnv({ dir });

  assert.equal(env.value("TEST_HOST"), undefined);

  env.setValue("TEST_HOST", "127.0.0.1");
  env.setValue("TEST_PORT", "43080");

  assert.equal(env.value("TEST_HOST"), "127.0.0.1");
  assert.equal(env.value("TEST_PORT"), "43080");

  assert.deepEqual(env.list(), [
    { key: "TEST_HOST", value: "127.0.0.1" },
    { key: "TEST_PORT", value: "43080" },
  ]);

  env.setValue("TEST_HOST", "192.168.1.10", {
    overwrite: false,
  });
  assert.equal(env.value("TEST_HOST"), "127.0.0.1");

  env.setValue("TEST_HOST", "192.168.1.10", {
    overwrite: true,
  });
  assert.equal(env.value("TEST_HOST"), "192.168.1.10");

  assert.equal(env.deleteValue("TEST_PORT"), true);
  assert.equal(env.value("TEST_PORT"), undefined);
  assert.equal(env.deleteValue("TEST_PORT"), false);

  const contents = readFileSync(path.join(dir, ".env"), "utf8");

  assert.match(contents, /^TEST_HOST=192\.168\.1\.10$/m);
  assert.doesNotMatch(contents, /^TEST_PORT=/m);

  const reloaded = new MemphisEnv({ dir });

  assert.equal(reloaded.value("TEST_HOST"), "192.168.1.10");
  assert.equal(reloaded.value("TEST_PORT"), undefined);
});
