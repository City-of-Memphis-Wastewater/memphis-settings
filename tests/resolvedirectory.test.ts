import { describe, it } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";

import { resolveDirectory } from "../src/helpers.ts";

describe("resolveDirectory", () => {
  const home = os.homedir();

  it("expands a tilde by itself", () => {
    assert.equal(resolveDirectory("~"), path.resolve(home));
  });

  it("expands a tilde-prefixed path", () => {
    assert.equal(resolveDirectory("~/.myapp"), path.resolve(home, ".myapp"));
  });

  it("expands a Windows-style tilde-prefixed path", () => {
    assert.equal(
      resolveDirectory(String.raw`~\.myapp`),
      path.resolve(home, ".myapp"),
    );
  });

  it("resolves relative paths against the working directory", () => {
    assert.equal(
      resolveDirectory("./config"),
      path.resolve(process.cwd(), "config"),
    );
  });

  it("resolves parent-directory references", () => {
    assert.equal(
      resolveDirectory("../config"),
      path.resolve(process.cwd(), "../config"),
    );
  });

  it("preserves absolute paths", () => {
    const absolutePath = path.resolve(os.tmpdir(), "myapp");

    assert.equal(resolveDirectory(absolutePath), absolutePath);
  });
});
