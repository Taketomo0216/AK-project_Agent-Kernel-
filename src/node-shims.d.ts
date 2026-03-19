declare const process: { cwd(): string; };
declare const __dirname: string;

declare module 'fs' {
  export function readFileSync(path: string, encoding: string): string;
}

declare module 'path' {
  export function join(...parts: string[]): string;
}

declare module 'assert/strict' {
  const assert: {
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    match(actual: string, expected: RegExp, message?: string): void;
  };
  export = assert;
}

declare module 'test' {
  function test(name: string, fn: () => void | Promise<void>): void;
  export = test;
}

declare module 'node:fs' { export * from 'fs'; }
declare module 'node:path' { export * from 'path'; }
declare module 'node:assert/strict' { import assert = require('assert/strict'); export = assert; }
declare module 'node:test' { import test = require('test'); export = test; }
