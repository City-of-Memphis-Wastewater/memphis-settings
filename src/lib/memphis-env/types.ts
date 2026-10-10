// src/lib/memphis-env/types.ts

export type EnvValue = string | number | boolean;

export interface MemphisEnvOptions {
  dir?: string;
}

export interface MemphisEnvSetOptions {
  overwrite?: boolean;
}
