import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MemphisConfig } from "../src/index.ts";

test("MemphisConfig: CRUD and overwrite behavior", (t) => {
  const appDir = mkdtempSync(path.join(os.tmpdir(), "memphis-config-test-"));
  t.after(() => rmSync(appDir, { recursive: true, force: true }));

  const config = new MemphisConfig({ appDir });

  config.setValue("eds", "host", "127.0.0.1");
  config.setValue("eds", "port", 43080);

  assert.equal(config.value("eds", "host"), "127.0.0.1");
  assert.equal(config.value("eds", "port"), 43080);

  assert.deepEqual(config.list(), [
    { service: "eds", item: "host", value: "127.0.0.1" },
    { service: "eds", item: "port", value: 43080 },
  ]);

  config.setValue("eds", "host", "192.168.1.10", {
    overwrite: false,
  });
  assert.equal(config.value("eds", "host"), "127.0.0.1");

  config.setValue("eds", "host", "192.168.1.10", {
    overwrite: true,
  });
  assert.equal(config.value("eds", "host"), "192.168.1.10");

  assert.equal(config.deleteValue("eds", "port"), true);
  assert.equal(config.value("eds", "port"), undefined);
  assert.equal(config.deleteValue("eds", "port"), false);
});
