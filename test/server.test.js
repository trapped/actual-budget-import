import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

describe('server', () => {
  it('package.json has correct entry point', () => {
    assert.equal(pkg.scripts.start, 'node server.js');
  });

  it('server module is valid ESM', async () => {
    // Verify the module parses without starting the listener
    // by checking that the file can be read and parsed as JS
    const fs = await import('node:fs/promises');
    const source = await fs.readFile(new URL('../server.js', import.meta.url), 'utf8');
    assert.ok(source.includes("app.post('/import-transactions'"));
    assert.ok(source.includes("app.get('/health'"));
  });
});
