import { describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";

import { resolveDirectory } from "../src/helpers.ts";

describe("resolveDirectory", () => {
  const home = os.homedir();

  it("expands a tilde by itself", () => {
    expect(resolveDirectory("~")).toBe(path.resolve(home));
  });

  it("expands a tilde-prefixed path", () => {
    expect(resolveDirectory("~/.myapp")).toBe(
      path.resolve(home, ".myapp"),
    );
  });

  it("expands a Windows-style tilde-prefixed path", () => {
    expect(resolveDirectory("~\\.myapp")).toBe(
      path.resolve(home, ".myapp"),
    );
  });

  it("resolves relative paths against the working directory", () => {
    expect(resolveDirectory("./config")).toBe(
      path.resolve(process.cwd(), "config"),
    );
  });

  it("resolves parent-directory references", () => {
    expect(resolveDirectory("../config")).toBe(
      path.resolve(process.cwd(), "../config"),
    );
  });

  it("preserves absolute paths", () => {
    const absolutePath = path.resolve(os.tmpdir(), "myapp");

    expect(resolveDirectory(absolutePath)).toBe(absolutePath);
  });
});
