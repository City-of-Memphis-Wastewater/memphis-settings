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

---

## CLI

Call the CLI like this:

```
npx memphis-settings --help
```

Help

```
memphis-settings

Usage:
memphis-settings [--app-dir PATH] [--dir PATH] <manager> <command> [arguments]

Managers:
config    Manage plaintext configuration
secret    Manage encrypted credentials
env       Manage .env variables

Commands:
list
get KEY
set KEY VALUE
delete KEY

Config commands:
config list
config get SERVICE ITEM
config set SERVICE ITEM VALUE
config delete SERVICE ITEM

Secret commands:
secret init
secret list
secret get SERVICE ITEM [--emit]
secret set SERVICE ITEM
secret delete SERVICE ITEM

Env commands:
env list
env get KEY
env set KEY VALUE
env delete KEY

Options:
--app-dir PATH   Select the application directory for nested config and secret
--dir PATH       Select the directory containing .env
--emit, -e       Emit a secret value to stdout
--help, -h       Show help

Examples:
memphis-settings config list
memphis-settings config get eds host
memphis-settings config set eds host 123.4.56.789
memphis-settings secret init
memphis-settings secret get eds password
memphis-settings secret get eds password --emit
memphis-settings secret set eds password
memphis-settings env list
memphis-settings env set EDS_HOST 123.45.6.789
memphis-settings --app-dir ~/.plantmap-sv config list
memphis-settings --dir ../plantmap-sv env list

Note that config and secret bootstrap library functions take a name like 'myapp' and associate it with a local app dir like '~/.myapp'.
Ergo, when using the --app-dir flag, that while the --app-dir can be any dir, usage like '--app-dir ~/.myapp', based in the home directory, is expected.
A nested hidden .memphis-config dir or .memphis-secret dir will be referened in the --app-dir specified.
It is important to understand that 'memphis-settings --app-dir ~/.myapp config' references a file nested at '~/.myapp/.memphis-config/values.json'.
In the same way 'memphis-settings --app-dir ~/.myapp secret' references a file nested at '~/.myapp/.memphis-secret/vault.db'.
The intended home dir based design follows the ethos that it is not recommended that secret or config files to be used inside of development directories where library or app code is, to avoid the risk of accidental git tracking.


As for .env files, that's your business. '--dir target env' means './target/.env'.
```

---

## Source code

https://github.com/City-of-Memphis-Wastewater/memphis-settings

## npm package

https://www.npmjs.com/package/memphis-settings
