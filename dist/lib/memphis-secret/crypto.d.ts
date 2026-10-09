export declare function initializeKey(appDir?: string): void;
export declare function encrypt(value: string, appDir?: string): Buffer;
export declare function decrypt(encrypted: Uint8Array, appDir?: string): string;
