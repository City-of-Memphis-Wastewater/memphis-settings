import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDirs: string[] = [];
const cliPath = path.resolve("bin/memphis-settings.js");

function createTempDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "memphis-cli-test-"));
  tempDirs.push(dir);
  return dir;
}

function runCli(args: string[], home: string, cwd: string) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: home,
    },
  });
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("memphis-settings CLI", () => {
  it("writes config under an explicit app directory", () => {
    const appDir = createTempDir();
    const cwd = createTempDir();

    const result = runCli(
      ["--app-dir", appDir, "config", "set", "test", "key", "value"],
      createTempDir(),
      cwd,
    );

    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);

    const configPath = path.join(appDir, ".memphis-config", "values.json");

    const saved = JSON.parse(readFileSync(configPath, "utf8"));
    assert.equal(saved.test.key, "value");
  });

    const configPath = path.join(
      home,
      ".fixture",
      ".memphis-config",
      "values.json",
    );
    console.log("CLI stdout:", result.stdout);
    console.log("CLI stderr:", result.stderr);
    console.log("CLI status:", result.status);
    console.log("Expected config:", configPath);
    console.log("Home:", home);

    const saved = JSON.parse(readFileSync(configPath, "utf8"));
    assert.equal(saved.test.key, "value");
  });

  it("returns a nonzero exit code for an unknown manager", () => {
    const home = createTempDir();
    const cwd = createTempDir();

    const result = runCli(["unknown"], home, cwd);

    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.includes("Unknown manager"));
  });
});
