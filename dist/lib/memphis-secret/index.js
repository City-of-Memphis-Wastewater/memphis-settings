// src/lib/memphis-secret/lib/index.ts
import os from 'node:os';
import { decrypt, encrypt, initializeKey } from "./crypto.js";
import { getCredential, initializeVault, isVaultInitialized, listCredentials, removeCredential, setCredential } from "./vault.js";
export class MemphisSecret {
    appDir;
    /**
     * Create a MemphisSecret instance.
     *
     * By default, the vault is stored under the user's home
     * directory. An application-specific directory can be
     * supplied when the application needs its own secret store.
     */
    constructor(options = {}) {
        this.appDir = options.appDir ?? os.homedir();
    }
    /**
     * Check whether the secret vault has been initialized.
     *
     * This does not create the vault or encryption key.
     */
    isInitialized() {
        return isVaultInitialized(this.appDir);
    }
    /**
     * Initialize the encryption key and secret vault.
     *
     * Existing key and vault files are preserved by the
     * underlying initialization functions.
     */
    initializeVault() {
        initializeKey(this.appDir);
        initializeVault(this.appDir);
    }
    /**
     * Retrieve a secret by service and item.
     *
     * Example:
     *
     *     secret.value('eds', 'username');
     */
    value(service, item) {
        this.validateNames(service, item);
        const encrypted = getCredential(service, item, this.appDir);
        if (encrypted === undefined || encrypted === null) {
            return undefined;
        }
        return decrypt(encrypted, this.appDir);
    }
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
    setValue(service, item, value, options = {}) {
        this.validateNames(service, item);
        const encrypted = encrypt(value, this.appDir);
        setCredential(service, item, encrypted, this.appDir, options.overwrite ?? true);
    }
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
    remove(service, item) {
        this.validateNames(service, item);
        return removeCredential(service, item, this.appDir);
    }
    /**
     * List stored secret identifiers.
     *
     * Secret values are not returned.
     */
    list() {
        return listCredentials(this.appDir);
    }
    validateNames(service, item) {
        if (typeof service !== 'string' || service.trim() === '') {
            throw new Error('[memphis-secret] Service must be a non-empty string.');
        }
        if (typeof item !== 'string' || item.trim() === '') {
            throw new Error('[memphis-secret] Item must be a non-empty string.');
        }
    }
}
