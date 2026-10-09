#!/usr/bin/env node

import { runCli } from "../dist/lib/cli/index.js";

await runCli(process.argv.slice(2));
