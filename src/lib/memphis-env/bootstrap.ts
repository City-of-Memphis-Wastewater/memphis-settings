// src/lib/memphis-env/bootstrap.ts
// the standard approach is for .env to be in root

import { MemphisEnv } from "./index.ts";
import type { MemphisEnvOptions } from "./types.ts";

export function bootstrapMemphisEnv(
  options: MemphisEnvOptions = {},
): MemphisEnv {
  return new MemphisEnv(options);
}
