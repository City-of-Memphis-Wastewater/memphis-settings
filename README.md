# memphis-settings

Manage encrypted secrets, plain-text configs, and .env settings locally.

## memphis-secret

Two-key encrypted AES-256 local value store.

## memphis-config

Two-key plaintext local value store.

## memphis-env

CRUD for .env file in package root.

## Source code

https://github.com/City-of-Memphis-Wastewater/memphis-settings

## npm package

https://www.npmjs.com/package/memphis-settings

---

## Usage

```ts
import { MemphisSecret } from "memphis-settings";
const secret = new MemphisSecret();
secret.initializeVault();
```

This sets up the secret vault file reference for `~/.memphis-secret/vault.db`.

```ts
import { MemphisConfig } from "memphis-settings";
const config = new MemphisConfig();
```

This sets up the config file reference for `~/.memphis-config/values.json`.


```ts
import { MemphisEnv } from "memphis-settings";
const env = new MemphisEnv();
```

This sets up the `.env` file reference in the root directory, the current working directory.

