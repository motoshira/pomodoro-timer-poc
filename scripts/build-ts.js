#!/usr/bin/env node

import { build } from 'esbuild';
import { glob } from 'glob';
import { mkdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function buildTypeScript() {
  // Find all TypeScript source files
  const sourceFiles = await glob('**/*.ts', {
    cwd: projectRoot,
    absolute: true,
    ignore: ['node_modules/**', 'dist/**', 'scripts/**'],
  });

  console.log(`Found ${sourceFiles.length} TypeScript file(s) to compile`);

  // Ensure dist directory exists
  await mkdir(join(projectRoot, 'dist'), { recursive: true });

  // Build each file individually to preserve directory structure
  await build({
    entryPoints: sourceFiles,
    outdir: 'dist',
    outbase: '.',
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    logLevel: 'info',
  });

  console.log('✓ TypeScript compiled successfully');
}

buildTypeScript().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
