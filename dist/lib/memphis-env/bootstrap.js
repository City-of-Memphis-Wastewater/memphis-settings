// the standard approach is for .env to be in root
import { MemphisEnv } from "./index.js";
export function bootstrapMemphisEnv() {
    return new MemphisEnv();
}
/*
import { bootstrapMemphisEnv } from 'memphis-env/bootstrap';
*/
