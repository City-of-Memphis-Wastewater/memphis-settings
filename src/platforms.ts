// src/platforms.ts
import os from "node:os";

export function isWindows(): boolean {
  return process.platform === "win32";
}

export function isMacOS(): boolean {
  return process.platform === "darwin";
}

export function isLinux(): boolean {
  return process.platform === "linux";
}

export function isAndroid(): boolean {
  return (
    process.env.ANDROID_ROOT !== undefined ||
    process.env.ANDROID_DATA !== undefined
  );
}

export function isTermux(): boolean {
  return (
    isAndroid() &&
    process.env.PREFIX?.startsWith("/data/data/com.termux/") === true
  );
}

export function isWSL(): boolean {
  return (
    isLinux() &&
    (process.env.WSL_DISTRO_NAME !== undefined ||
      os.release().toLowerCase().includes("microsoft"))
  );
}
