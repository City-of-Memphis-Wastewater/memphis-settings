# memphis-settings

Manage encrypted secrets, plain-text configs, and .env settings locally.

## memphis-secret

Two-key encrypted AES-256 local value store.

## memphis-config

Two-key plaintext local value store.

## memphis-env

CRUD for .env file in package root.

---

## Library Usage

```ts
import { MemphisSecret } from "memphis-settings";
const secret = new MemphisSecret();
secret.initializeVault();

// Set (recommended in CLI, not scripts)
secret.setValue("eds", "username", "test");
secret.setValue("eds", "password", "secret");

// Get
const username = secret.getValue("eds", "username");

// List
const credentials = secret.list();

// Remove
secret.remove("eds", "password");
```

This sets up the secret vault file reference for `~/.memphis-secret/vault.db`.

```ts
import { MemphisConfig } from "memphis-settings";
const config = new MemphisConfig();

// Set
config.setValue("eds", "host", "192.168.1.10");
config.setValue("eds", "port", 43080);

// Get
const host = config.getValue("eds", "host");

// List
const values = config.list();

// Delete
config.deleteValue("eds", "port");
```

This sets up the config file reference for `~/.memphis-config/values.json`.

```ts
import { MemphisEnv } from "memphis-settings";
const env = new MemphisEnv();

// Set
env.setValue("EDS_HOST", "192.168.1.10");
env.setValue("EDS_PORT", "43080");

// Get
const host = env.getValue("EDS_HOST");

// List
const values = env.list();

// Delete
env.deleteValue("EDS_PORT");
```

This sets up the `.env` file reference in the root directory, the current working directory.

---

## CLI

Call the CLI like this:

```
npx memphis-settings --help
```

Help

<p align="center">
  <img src="https://raw.githubusercontent.com/City-of-Memphis-Wastewater/memphis-settings/main/assets/memphis-settings-help-v0.0.7.svg" style="width: 100%; max-width: 850px;" alt="SVG help" />
</p>

---

## Source code

https://github.com/City-of-Memphis-Wastewater/memphis-settings

## npm package

https://www.npmjs.com/package/memphis-settings
