import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDirs: string[] = [];

// Replace this with the actual CLI executable path from package.json.
const cliPath = path.resolve("bin/memphis-settings.js");

function createTempDir(): string {
  const dir = mkdtempSync(
    path.join(os.tmpdir(), "memphis-cli-test-"),
  );

  tempDirs.push(dir);
  return dir;
}

function runCli(args: string[], home: string, cwd: string) {
  return spawnSync(
    process.execPath,
    [cliPath, ...args],
    {
      cwd,
      encoding: "utf8",
      env: {
        ...process.env,
        HOME: home,
      },
    },
  );
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("memphis-settings CLI", () => {
  it("writes config under a tilde-prefixed app directory", () => {
    const home = createTempDir();
    const cwd = createTempDir();

    const result = runCli(
      [
        "--app-dir",
        "~/.fixture",
        "config",
        "set",
        "test",
        "key",
        "value",
      ],
      home,
      cwd,
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);

    const configPath = path.join(
      home,
      ".fixture",
      ".memphis-config",
      "values.json",
    );

    const saved = JSON.parse(readFileSync(configPath, "utf8"));

    expect(saved.test.key).toBe("value");
  });

  it("returns a nonzero exit code for an unknown manager", () => {
    const home = createTempDir();
    const cwd = createTempDir();

    const result = runCli(["unknown"], home, cwd);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown manager");
  });
});
