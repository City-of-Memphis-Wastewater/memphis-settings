import os from 'node:os';
import path from 'node:path';
export function getSecretDir(appDir) {
    return path.join(appDir ?? os.homedir(), '.memphis-secret');
}
export function getVaultPath(appDir) {
    return path.join(getSecretDir(appDir), 'vault.db');
}
export function getKeyPath(appDir) {
    return path.join(getSecretDir(appDir), '.key');
}
