#!/usr/bin/env node

import { build } from 'esbuild';
import { glob } from 'glob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Move all imports to the top of the file (before any code)
 * This is necessary because esbuild places internal code before external imports
 * which violates ESM syntax rules
 */
async function fixImportsPosition(filePath) {
  let content = await readFile(filePath, 'utf-8');

  // Extract all import statements
  const importRegex = /^import\s+.+\s+from\s+["'].+["'];?\s*$/gm;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[0]);
  }

  if (imports.length > 0) {
    // Remove all import statements from the content
    content = content.replace(importRegex, '');

    // Remove extra blank lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    // Prepend all imports at the top
    const newContent = imports.join('\n') + '\n\n' + content.trimStart();
    await writeFile(filePath, newContent, 'utf-8');
  }
}

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
      external: ['gi://*', 'resource://*', 'system'],
      plugins: [
        {
          name: 'gjs-external',
          setup(build) {
            // Mark all gi:// imports as external
            build.onResolve({ filter: /^gi:\/\// }, args => ({
              path: args.path,
              external: true
            }));
          }
        }
      ],
      logLevel: 'warning'
    });

    // Fix imports position in the bundled file
    await fixImportsPosition(outputPath);
  }

  console.log('Test bundling complete');
}

bundleTests().catch((err) => {
  console.error('Error bundling tests:', err);
  process.exit(1);
});
