import os from 'node:os';
import path from 'node:path';
import { MemphisSecret } from "./index.js";
export function bootstrapMemphisSecret(appName) {
    const appDir = path.join(os.homedir(), `.${appName}`);
    return new MemphisSecret({
        appDir
    });
}
