// src/lib/memphis-config/lib/index.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
export class MemphisConfig {
    configFile;
    values = {};
    constructor(options = {}) {
        const configDir = options.appDir
            ? path.join(options.appDir, '.memphis-config')
            : path.join(os.homedir(), '.memphis-config');
        this.configFile = path.join(configDir, 'values.json');
        if (!existsSync(this.configFile)) {
            return;
        }
        const contents = readFileSync(this.configFile, 'utf8');
        const parsed = JSON.parse(contents);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new Error('[memphis-config] Configuration file must contain a JSON object.');
        }
        Object.assign(this.values, parsed);
    }
    validateNames(service, item) {
        if (typeof service !== 'string' || service.trim() === '') {
            throw new Error('[memphis-config] Service must be a non-empty string.');
        }
        if (typeof item !== 'string' || item.trim() === '') {
            throw new Error('[memphis-config] Item must be a non-empty string.');
        }
    }
    save() {
        mkdirSync(path.dirname(this.configFile), { recursive: true });
        writeFileSync(this.configFile, JSON.stringify(this.values, null, 2) + '\n', 'utf8');
    }
    isInitialized() {
        return existsSync(this.configFile);
    }
    value(service, item) {
        this.validateNames(service, item);
        const serviceValues = this.values[service];
        if (typeof serviceValues !== 'object' ||
            serviceValues === null ||
            Array.isArray(serviceValues)) {
            return undefined;
        }
        return Object.hasOwn(serviceValues, item) ? serviceValues[item] : undefined;
    }
    setValue(service, item, value, options = {}) {
        this.validateNames(service, item);
        if (value === undefined) {
            throw new Error('[memphis-config] Configuration value cannot be undefined.');
        }
        let serviceValues = this.values[service];
        if (typeof serviceValues !== 'object' ||
            serviceValues === null ||
            Array.isArray(serviceValues)) {
            serviceValues = {};
            this.values[service] = serviceValues;
        }
        const entries = serviceValues;
        const exists = Object.hasOwn(entries, item);
        if (exists && options.overwrite !== true) {
            console.log(`[memphis-config] Configuration already exists: ${service}.${item}`);
            return;
        }
        entries[item] = value;
        this.save();
        console.log(exists
            ? `[memphis-config] Configuration overwritten: ${service}.${item}`
            : `[memphis-config] Configuration stored: ${service}.${item}`);
    }
    deleteValue(service, item) {
        this.validateNames(service, item);
        const serviceValues = this.values[service];
        if (typeof serviceValues !== 'object' ||
            serviceValues === null ||
            Array.isArray(serviceValues) ||
            !Object.hasOwn(serviceValues, item)) {
            console.log(`[memphis-config] Configuration not found: ${service}.${item}`);
            return false;
        }
        delete serviceValues[item];
        this.save();
        console.log(`[memphis-config] Configuration deleted: ${service}.${item}`);
        return true;
    }
    list() {
        const items = [];
        for (const [service, serviceValues] of Object.entries(this.values)) {
            if (typeof serviceValues !== 'object' ||
                serviceValues === null ||
                Array.isArray(serviceValues)) {
                continue;
            }
            for (const [item, value] of Object.entries(serviceValues)) {
                items.push({
                    service,
                    item,
                    value
                });
            }
        }
        return items;
    }
}
