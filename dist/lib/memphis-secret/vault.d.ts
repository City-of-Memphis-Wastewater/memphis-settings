import type { MemphisSecretItem } from './types.ts';
export interface VaultCredential {
    service: string;
    item: string;
    encryptedSecret: Buffer;
}
export declare function isVaultInitialized(appDir?: string): boolean;
export declare function initializeVault(appDir?: string): void;
export declare function getCredential(service: string, item: string, appDir?: string): Buffer | undefined;
export declare function setCredential(service: string, item: string, encryptedSecret: Buffer, appDir?: string, overwrite?: boolean): void;
export declare function removeCredential(service: string, item: string, appDir?: string): boolean;
export declare function listCredentials(appDir?: string): MemphisSecretItem[];
