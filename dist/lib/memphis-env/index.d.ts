import type { EnvValue, MemphisEnvOptions, MemphisEnvSetOptions } from './types.ts';
export declare class MemphisEnv {
    private readonly envFile;
    private readonly values;
    constructor(options?: MemphisEnvOptions);
    value(key: string): EnvValue | undefined;
    requiredValue(key: string): string;
    setValue(key: string, value: EnvValue, options?: MemphisEnvSetOptions): void;
}
