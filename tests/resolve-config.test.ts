import { describe, it } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";

import { MemphisConfig } from "../src/lib/memphis-config/index.ts";

describe("MemphisConfig directory resolution", () => {
  it("expands a tilde-prefixed appDir", () => {
    const tempHome = mkdtempSync(
      path.join(os.tmpdir(), "memphis-config-test-"),
    );

    const appDir = path.join(tempHome, ".myapp");

    try {
      const config = new MemphisConfig({ appDir });

      config.setValue("test", "key", "value", { overwrite: true });

      const configPath = path.join(appDir, ".memphis-config", "values.json");

      const saved = JSON.parse(readFileSync(configPath, "utf8"));

      expect(saved.test.key).toBe("value");
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });
});
