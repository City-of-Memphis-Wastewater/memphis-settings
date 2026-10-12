// src/bootstrap.ts

import os from "node:os";
import path from "node:path";

import { MemphisConfig } from "./lib/memphis-config/index.ts";
import { MemphisEnv } from "./lib/memphis-env/index.ts";
import { MemphisSecret } from "./lib/memphis-secret/index.ts";

import type { MemphisEnvOptions } from "./lib/memphis-env/types.ts";

/*
Q: What do bootstrapMemphisConfig() and bootstrapMemphisSecret() accomplish?
A: An appName string like 'myapp' is translated to an appDir value in a user's home directory like '~/.myapp/'.

It is important to understand that
```ts
MemphisConfig(app-dir='~/.myapp')
```
references a file nested at '~/.myapp/.memphis-config/values.json'.

In the same way,
```ts
MemphisConfig(app-dir='~/.myapp')
```
references a file nested at '~/.myapp/.memphis-secret/vault.db'.
*/

export function bootstrapMemphisConfig(appName: string): MemphisConfig {
  const appDir = path.join(os.homedir(), `.${appName}`);

  return new MemphisConfig({ appDir });
}

export function bootstrapMemphisSecret(appName: string): MemphisSecret {
  const appDir = path.join(os.homedir(), `.${appName}`);

  return new MemphisSecret({ appDir });
}

/* The standard approach is for .env to be in root.
Ergo, the function signature for bootstrapMemphisEnv() is asymmetric from the other bootstrap functions.

*/

export function bootstrapMemphisEnv(
  options: MemphisEnvOptions = { dir = process.cwd() },
): MemphisEnv {
  return new MemphisEnv(options);
}
