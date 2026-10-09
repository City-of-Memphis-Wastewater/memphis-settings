import os from 'node:os';
import path from 'node:path';
import { MemphisConfig } from "./index.js";
export function bootstrapMemphisConfig(appName) {
    const appDir = path.join(os.homedir(), `.${appName}`);
    return new MemphisConfig({
        appDir
    });
}
