import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('vendor', { recursive: true });
await build({ stdin: { contents: "export { createClient } from '@supabase/supabase-js';", resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'browser', outfile: 'vendor/supabase.js', minify: true, legalComments: 'eof' });
