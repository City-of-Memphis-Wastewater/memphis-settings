import { createInterface } from "node:readline/promises";
import process from "node:process";

import { MemphisConfig } from "../memphis-config/index.ts";
import { MemphisEnv } from "../memphis-env/index.ts";
import { MemphisSecret } from "../memphis-secret/index.ts";

type ParsedArgs = {
  appDir?: string;
  dir?: string;
  emit: boolean;
  args: string[];
};

function writeOut(value: string): void {
  process.stdout.write(`${value}\n`);
}

function writeError(value: string): void {
  process.stderr.write(`${value}\n`);
}

function writeJson(value: unknown): void {
  writeOut(JSON.stringify(value, null, 2));
}

function printHelp(): void {
  writeOut(`memphis-settings

Usage:
memphis-settings [--app-dir PATH] [--dir PATH] <manager> <command> [arguments]

Managers:
config    Manage plaintext configuration
secret    Manage encrypted credentials
env       Manage .env variables

Commands:
list
get KEY
set KEY VALUE
delete KEY

Config commands:
config list
config get SERVICE ITEM
config set SERVICE ITEM VALUE
config delete SERVICE ITEM

Secret commands:
secret init
secret list
secret get SERVICE ITEM [--emit]
secret set SERVICE ITEM
secret delete SERVICE ITEM

Env commands:
env list
env get KEY
env set KEY VALUE
env delete KEY

Options:
--app-dir PATH   Select the application directory for config and secret
--dir PATH       Select the directory containing .env
--emit, -e       Emit a secret value to stdout
--help, -h       Show help

Examples:
memphis-settings config list
memphis-settings config get eds host
memphis-settings config set eds host 123.4.56.789
memphis-settings secret init
memphis-settings secret get eds password
memphis-settings secret get eds password --emit
memphis-settings secret set eds password
memphis-settings env list
memphis-settings env set EDS_HOST 123.45.6.789
memphis-settings --app-dir ~/.plantmap-sv config list
memphis-settings --dir ~/.plantmap-sv env list`);
}

function parseArgs(input: string[]): ParsedArgs {
  const args: string[] = [];
  let appDir: string | undefined;
  let dir: string | undefined;
  let emit = false;

  for (let i = 0; i < input.length; i++) {
    const arg = input[i];

    if (arg === "--app-dir" || arg === "--dir") {
      const option = arg;
      const value = input[++i];

      if (!value || value.startsWith("--")) {
        throw new Error(`${option} requires a directory path.`);
      }

      if (option === "--app-dir") {
        appDir = value;
      } else {
        dir = value;
      }

      continue;
    }

    if (arg === "--emit" || arg === "-e") {
      emit = true;
      continue;
    }

    args.push(arg);
  }

  return { appDir, dir, emit, args };
}

function parseConfigValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function requireArguments(args: string[], count: number, usage: string): void {
  if (args.length < count) {
    throw new Error(`Usage: ${usage}`);
  }
}

async function runConfig(config: MemphisConfig, args: string[]): Promise<void> {
  const [command, ...rest] = args;

  switch (command) {
    case "list": {
      writeJson(config.list());
      return;
    }

    case "get": {
      requireArguments(rest, 2, "memphis-settings config get SERVICE ITEM");

      const [service, item] = rest;
      const value = config.value(service, item);

      if (value === undefined) {
        throw new Error(`Configuration not found: ${service}/${item}`);
      }

      writeOut(typeof value === "string" ? value : JSON.stringify(value));
      return;
    }

    case "set": {
      requireArguments(
        rest,
        3,
        "memphis-settings config set SERVICE ITEM VALUE",
      );

      const [service, item, ...valueParts] = rest;
      const value = parseConfigValue(valueParts.join(" "));

      config.setValue(service, item, value as never, {
        overwrite: true,
      });

      return;
    }

    case "delete": {
      requireArguments(rest, 2, "memphis-settings config delete SERVICE ITEM");

      const [service, item] = rest;

      if (!config.deleteValue(service, item)) {
        throw new Error(`Configuration not found: ${service}/${item}`);
      }

      writeError(`Configuration deleted: ${service}/${item}`);
      return;
    }

    default:
      throw new Error(
        "Unknown config command. Use config list|get|set|delete.",
      );
  }
}

async function runSecret(
  secret: MemphisSecret,
  args: string[],
  emit: boolean,
): Promise<void> {
  const [command, ...rest] = args;

  switch (command) {
    case "init": {
      if (rest.length > 0) {
        throw new Error("Usage: memphis-settings secret init");
      }

      if (secret.isInitialized()) {
        writeError("Secret vault is already initialized.");
        return;
      }

      secret.initializeVault();
      writeError("Secret vault initialized.");
      return;
    }

    case "list": {
      if (emit) {
        throw new Error("--emit is only supported by secret get.");
      }

      writeJson(secret.list());
      return;
    }

    case "get": {
      requireArguments(
        rest,
        2,
        "memphis-settings secret get SERVICE ITEM [--emit]",
      );

      const [service, item] = rest;
      const value = secret.value(service, item);

      if (value === undefined) {
        throw new Error(`Secret not found: ${service}/${item}`);
      }

      if (emit) {
        writeOut(value);
      } else {
        writeError(`Credential found for ${service}/${item}`);
        writeError("(use --emit to emit value)");
      }

      return;
    }

    case "set": {
      requireArguments(rest, 2, "memphis-settings secret set SERVICE ITEM");

      if (rest.length > 2) {
        throw new Error(
          "Secret values must be entered at the prompt, not as command-line arguments.",
        );
      }

      if (emit) {
        throw new Error("--emit cannot be used with secret set.");
      }

      const [service, item] = rest;
      const prompt = createInterface({
        input: process.stdin,
        output: process.stderr,
      });

      try {
        const value = await prompt.question(
          `Secret value for ${service}/${item}: `,
        );

        secret.setValue(service, item, value);
        writeError(`Credential stored: ${service}/${item}`);
      } finally {
        prompt.close();
      }

      return;
    }

    case "delete": {
      requireArguments(rest, 2, "memphis-settings secret delete SERVICE ITEM");

      if (emit) {
        throw new Error("--emit cannot be used with secret delete.");
      }

      const [service, item] = rest;

      if (!secret.remove(service, item)) {
        throw new Error(`Secret not found: ${service}/${item}`);
      }

      writeError(`Credential removed: ${service}/${item}`);
      return;
    }

    default:
      throw new Error(
        "Unknown secret command. Use secret init|list|get|set|delete.",
      );
  }
}

async function runEnv(env: MemphisEnv, args: string[]): Promise<void> {
  const [command, ...rest] = args;

  switch (command) {
    case "list": {
      writeJson(env.list());
      return;
    }

    case "get": {
      requireArguments(rest, 1, "memphis-settings env get KEY");

      const [key] = rest;
      const value = env.value(key);

      if (value === undefined) {
        throw new Error(`Environment variable not found: ${key}`);
      }

      writeOut(String(value));
      return;
    }

    case "set": {
      requireArguments(rest, 2, "memphis-settings env set KEY VALUE");

      const [key, ...valueParts] = rest;
      env.setValue(key, valueParts.join(" "), { overwrite: true });

      writeError(`Environment variable stored: ${key}`);
      return;
    }

    case "delete": {
      requireArguments(rest, 1, "memphis-settings env delete KEY");

      const [key] = rest;

      if (!env.deleteValue(key)) {
        throw new Error(`Environment variable not found: ${key}`);
      }

      writeError(`Environment variable deleted: ${key}`);
      return;
    }

    default:
      throw new Error("Unknown env command. Use env list|get|set|delete.");
  }
}

export async function runCli(input: string[]): Promise<void> {
  try {
    const parsed = parseArgs(input);
    const { appDir, dir, emit, args } = parsed;

    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
      printHelp();
      return;
    }

    /*
     * Existing manager implementations use console.log for diagnostic
     * messages. In CLI mode, route those messages to stderr so stdout
     * remains suitable for JSON, shell pipelines, and --emit.
     */
    console.log = console.error.bind(console);

    const [manager, ...managerArgs] = args;

    if (manager === "env" && appDir !== undefined) {
      throw new Error(
        "Use --dir for env commands; --app-dir is for config and secret.",
      );
    }

    if (manager !== "env" && dir !== undefined) {
      throw new Error("--dir is only supported by env commands.");
    }

    switch (manager) {
      case "config":
        await runConfig(new MemphisConfig({ appDir }), managerArgs);
        return;

      case "secret":
        await runSecret(new MemphisSecret({ appDir }), managerArgs, emit);
        return;

      case "env":
        await runEnv(new MemphisEnv({ dir }), managerArgs);
        return;

      default:
        throw new Error(
          `Unknown manager: ${manager}. Use config, secret, or env.`,
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    writeError(message);
    process.exitCode = 1;
  }
}
