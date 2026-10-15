import os from 'node:os';
import path from 'node:path';

export function resolveDirectory(input: string): string {
    const expanded = input === '~'
        ? os.homedir()
        : input.startsWith('~/') || input.startsWith('~\\')
            ? path.join(os.homedir(), input.slice(2))
            : input;

    return path.resolve(expanded);
}
