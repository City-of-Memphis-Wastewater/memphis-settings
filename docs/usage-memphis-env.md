## Usage

### Explicit app directory, if you were so inclined

````ts
import { MemphisEnv } from 'memphis-env';

const env = new MemphisEnv({
    dir: '/target/dir/'
});
```

This .env file referenced is in the specified target dir. This is very different from how memphis-config and memphis-secret leverage the appDir argument.

## Standard usage for expected .env file

```ts
import { bootstrapMemphisEnv} from 'memphis-env/bootstrap';

const env = bootstrapMemphisEnv()
````

This sets us the env file reference for `./.env` in the root or the current working directory.

This has the same outcome as:

```ts
import { MemphisEnv } from "memphis-env";

const env = new MemphisEnv();
```
