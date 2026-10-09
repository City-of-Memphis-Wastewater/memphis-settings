// src/lib/memphis-env/index.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
export class MemphisEnv {
    envFile;
    values = {};
    constructor(options = {}) {
        const envDir = options.appDir ?? process.cwd();
        this.envFile = path.join(envDir, '.env');
        if (!existsSync(this.envFile)) {
            return;
        }
        const contents = readFileSync(this.envFile, 'utf8');
        for (const line of contents.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            const equals = trimmed.indexOf('=');
            if (equals === -1) {
                continue;
            }
            const key = trimmed.slice(0, equals).trim();
            let value = trimmed.slice(equals + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            this.values[key] = value;
        }
    }
    value(key) {
        return this.values[key];
    }
    requiredValue(key) {
        const value = this.value(key);
        if (value === undefined) {
            throw new Error(`Required environment variable is missing: ${key}`);
        }
        return String(value);
    }
    setValue(key, value, options = {}) {
        if (Object.hasOwn(this.values, key) && options.overwrite === false) {
            return;
        }
        this.values[key] = value;
        const envDir = path.dirname(this.envFile);
        mkdirSync(envDir, { recursive: true });
        const contents = Object.entries(this.values)
            .map(([name, envValue]) => `${name}=${envValue}`)
            .join('\n');
        writeFileSync(this.envFile, contents + '\n', 'utf8');
    }
}
