#!/usr/bin/env node

import { build } from 'esbuild';
import { glob } from 'glob';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function bundleTests() {
  // Find all test files from both spec and test directories
  const specFiles = await glob('dist/spec/**/*.spec.js', {
    cwd: projectRoot,
    absolute: true
  });

  const testFiles = await glob('dist/test/**/*.spec.js', {
    cwd: projectRoot,
    absolute: true
  });

  const allTestFiles = [...specFiles, ...testFiles];

  console.log(`Found ${allTestFiles.length} test file(s)`);

  // Create output directories
  await mkdir(join(projectRoot, 'dist/spec-bundled'), { recursive: true });
  await mkdir(join(projectRoot, 'dist/test-bundled'), { recursive: true });

  // Bundle each test file
  for (const testFile of allTestFiles) {
    let relativePath, outputPath;

    if (testFile.includes('/dist/spec/')) {
      relativePath = testFile.replace(join(projectRoot, 'dist/spec/'), '');
      outputPath = join(projectRoot, 'dist/spec-bundled', relativePath);
    } else {
      relativePath = testFile.replace(join(projectRoot, 'dist/test/'), '');
      outputPath = join(projectRoot, 'dist/test-bundled', relativePath);
    }

    console.log(`Bundling: ${relativePath}`);

    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    await build({
      entryPoints: [testFile],
      bundle: true,
      outfile: outputPath,
      platform: 'node',
      format: 'esm',
      external: [
        'gi://*',
        'resource://*',
        'system'
      ],
      logLevel: 'warning'
    });
  }

  console.log('Test bundling complete');
}

bundleTests().catch((err) => {
  console.error('Error bundling tests:', err);
  process.exit(1);
});
