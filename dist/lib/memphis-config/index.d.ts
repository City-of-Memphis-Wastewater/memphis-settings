import type { ConfigValue, MemphisConfigItem, MemphisConfigOptions, MemphisConfigSetOptions } from './types.ts';
export declare class MemphisConfig {
    private readonly configFile;
    private readonly values;
    constructor(options?: MemphisConfigOptions);
    private validateNames;
    private save;
    isInitialized(): boolean;
    value(service: string, item: string): ConfigValue | undefined;
    setValue(service: string, item: string, value: ConfigValue, options?: MemphisConfigSetOptions): void;
    deleteValue(service: string, item: string): boolean;
    list(): MemphisConfigItem[];
}
