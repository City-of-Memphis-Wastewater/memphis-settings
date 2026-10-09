// src/lib/cli/index.ts

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { MemphisConfig } from "../memphis-config/index.ts";
import { MemphisEnv } from "../memphis-env/index.ts";
import { MemphisSecret } from "../memphis-secret/index.ts";

type Manager = "config" | "secret" | "env";
type Action = "list" | "get" | "set" | "delete";

interface ParsedArgs {
  appDir?: string;
  emit: boolean;
  positional: string[];
}

function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    emit: false,
    positional: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--app-dir") {
      const value = args[++i];

      if (!value || value.startsWith("-")) {
        throw new Error("--app-dir requires a directory path.");
      }

      result.appDir = value;
      continue;
    }

    if (arg.startsWith("--app-dir=")) {
      result.appDir = arg.slice("--app-dir=".length);

      if (!result.appDir) {
        throw new Error("--app-dir requires a directory path.");
      }

      continue;
    }

    if (arg === "--emit" || arg === "-e") {
      result.emit = true;
      continue;
    }

    result.positional.push(arg);
  }

  return result;
}

function writeJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function writeError(message: string): void {
  console.error(message);
}

function requireArgs(
  args: string[],
  count: number,
  usage: string,
): void {
  if (args.length !== count) {
    throw new Error(`Usage: ${usage}`);
  }
}

function printHelp(): void {
  writeError(`
memphis-settings

Usage:
  memphis-settings [--app-dir PATH] <manager> <command> [arguments]

Managers:
  config    Manage plaintext configuration
  secret    Manage encrypted credentials
  env       Manage .env variables

Commands:
  list
  get KEY
  set KEY VALUE
  delete KEY

Config and secret keys use SERVICE ITEM.
Env keys use a single variable name.

Options:
  --app-dir PATH   Select the application directory
  --emit, -e       Emit a secret value to stdout

Examples:
  memphis-settings config list
  memphis-settings config get eds host
  memphis-settings config set eds host 172.19.4.127
  memphis-settings secret get eds password --emit
  memphis-settings secret set eds password
  memphis-settings env list
  memphis-settings env set EDS_HOST 172.19.4.127
  memphis-settings --app-dir ./plantmap config list
`);
}

async function promptSecret(): Promise<string> {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error(
      "Secret input requires an interactive terminal. " +
        "Use an interactive terminal to avoid exposing secrets in arguments.",
    );
  }

  const terminal = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
  });

  try {
    const answer = await terminal.question("Secret value: ");
    return answer;
  } finally {
    terminal.close();
  }
}

export async function runCli(args: string[]): Promise<void> {
  try {
    const parsed = parseArgs(args);
    const [managerArg, actionArg, ...rest] = parsed.positional;

    if (!managerArg || managerArg === "help" || managerArg === "--help") {
      printHelp();
      return;
    }

    if (
      managerArg !== "config" &&
      managerArg !== "secret" &&
      managerArg !== "env"
    ) {
      throw new Error(`Unknown manager: ${managerArg}`);
    }

    if (actionArg === "--help" || actionArg === "help") {
      printHelp();
      return;
    }

    if (
      actionArg !== "list" &&
      actionArg !== "get" &&
      actionArg !== "set" &&
      actionArg !== "delete"
    ) {
      throw new Error(`Unknown command: ${actionArg ?? "(missing)"}`);
    }

    const manager: Manager = managerArg;
    const action: Action = actionArg;

    if (parsed.emit && manager !== "secret") {
      throw new Error("--emit is only supported by the secret manager.");
    }

    const appDir = parsed.appDir;

    if (manager === "config") {
      const config = new MemphisConfig({ appDir });

      if (action === "list") {
        requireArgs(rest, 0, "memphis-settings config list");
        writeJson(config.list());
        return;
      }

      if (action === "get") {
        requireArgs(rest, 2, "memphis-settings config get SERVICE ITEM");

        const value = config.value(rest[0], rest[1]);

        if (value === undefined) {
          throw new Error(`Configuration not found: ${rest[0]}.${rest[1]}`);
        }

        if (typeof value === "string") {
          console.log(value);
        } else {
          writeJson(value);
        }

        return;
      }

      if (action === "set") {
        requireArgs(
          rest,
          3,
          "memphis-settings config set SERVICE ITEM VALUE",
        );

        const [service, item, ...valueParts] = rest;
        const rawValue = valueParts.join(" ");

        let value: unknown;

        try {
          value = JSON.parse(rawValue);
        } catch {
          value = rawValue;
        }

        config.setValue(service, item, value as never, {
          overwrite: true,
        });

        return;
      }

      requireArgs(rest, 2, "memphis-settings config delete SERVICE ITEM");

      if (!config.deleteValue(rest[0], rest[1])) {
        throw new Error(`Configuration not found: ${rest[0]}.${rest[1]}`);
      }

      return;
    }

    if (manager === "secret") {
      const secret = new MemphisSecret({ appDir });

      if (action === "list") {
        requireArgs(rest, 0, "memphis-settings secret list");
        writeJson(secret.list());
        return;
      }

      if (action === "get") {
        requireArgs(rest, 2, "memphis-settings secret get SERVICE ITEM");

        const [service, item] = rest;
        const value = secret.value(service, item);

        if (value === undefined) {
          throw new Error(`Secret not found: ${service}/${item}`);
        }

        if (parsed.emit) {
          console.log(value);
        } else {
          writeError(`Secret exists: ${service}/${item}`);
        }

        return;
      }

      if (action === "set") {
        requireArgs(rest, 2, "memphis-settings secret set SERVICE ITEM");

        const [service, item] = rest;
        const value = await promptSecret();

        secret.setValue(service, item, value, {
          overwrite: true,
        });

        writeError(`Secret stored: ${service}/${item}`);
        return;
      }

      requireArgs(rest, 2, "memphis-settings secret delete SERVICE ITEM");

      if (!secret.remove(rest[0], rest[1])) {
        throw new Error(`Secret not found: ${rest[0]}/${rest[1]}`);
      }

      writeError(`Secret deleted: ${rest[0]}/${rest[1]}`);
      return;
    }

    const env = new MemphisEnv({ appDir });

    if (action === "list") {
      requireArgs(rest, 0, "memphis-settings env list");
      writeJson(env.list());
      return;
    }

    if (action === "get") {
      requireArgs(rest, 1, "memphis-settings env get KEY");

      const value = env.value(rest[0]);

      if (value === undefined) {
        throw new Error(`Environment variable not found: ${rest[0]}`);
      }

      console.log(value);
      return;
    }

    if (action === "set") {
      requireArgs(rest, 2, "memphis-settings env set KEY VALUE");

      env.setValue(rest[0], rest[1], {
        overwrite: true,
      });

      return;
    }

    requireArgs(rest, 1, "memphis-settings env delete KEY");

    if (!env.deleteValue(rest[0])) {
      throw new Error(`Environment variable not found: ${rest[0]}`);
    }
  } catch (error) {
    writeError(
      error instanceof Error ? error.message : String(error),
    );

    process.exitCode = 1;
  }
}
