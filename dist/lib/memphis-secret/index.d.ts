import type { MemphisSecretItem, MemphisSecretOptions, MemphisSecretSetOptions, SecretValue } from './types.ts';
export declare class MemphisSecret {
    private readonly appDir;
    /**
     * Create a MemphisSecret instance.
     *
     * By default, the vault is stored under the user's home
     * directory. An application-specific directory can be
     * supplied when the application needs its own secret store.
     */
    constructor(options?: MemphisSecretOptions);
    /**
     * Check whether the secret vault has been initialized.
     *
     * This does not create the vault or encryption key.
     */
    isInitialized(): boolean;
    /**
     * Initialize the encryption key and secret vault.
     *
     * Existing key and vault files are preserved by the
     * underlying initialization functions.
     */
    initializeVault(): void;
    /**
     * Retrieve a secret by service and item.
     *
     * Example:
     *
     *     secret.value('eds', 'username');
     */
    value(service: string, item: string): SecretValue | undefined;
    /**
     * Store a secret by service and item.
     *
     * Existing secrets are overwritten by default.
     * Pass `{ overwrite: false }` to preserve an existing secret.
     *
     * Example:
     *
     *     secret.setValue('eds', 'username', 'operator');
     */
    setValue(service: string, item: string, value: SecretValue, options?: MemphisSecretSetOptions): void;
    /**
     * Remove a secret by service and item.
     *
     * Returns true when the secret was removed, or false
     * when it did not exist.
     *
     * Example:
     *
     *     secret.remove('eds', 'username');
     */
    remove(service: string, item: string): boolean;
    /**
     * List stored secret identifiers.
     *
     * Secret values are not returned.
     */
    list(): MemphisSecretItem[];
    private validateNames;
}
