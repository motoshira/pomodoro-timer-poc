#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Read template
const templatePath = join(PROJECT_ROOT, 'resources/pomodoro.gresource.xml.mustache');
const template = readFileSync(templatePath, 'utf-8');

// Find all .ui files in resources/ui directory
const uiDir = join(PROJECT_ROOT, 'resources/ui');
let uiFiles = [];

try {
  const files = readdirSync(uiDir);
  uiFiles = files
    .filter(file => file.endsWith('.ui'))
    .sort()
    .map(name => ({ name }));
} catch (error) {
  console.warn('Warning: resources/ui directory not found. Generating empty gresource XML.');
}

// Generate XML from template
const data = { uiFiles };
const output = Mustache.render(template, data);

// Write output
const outputPath = join(PROJECT_ROOT, 'resources/pomodoro.gresource.xml');
writeFileSync(outputPath, output, 'utf-8');

console.log(`✓ Generated ${outputPath} with ${uiFiles.length} UI file(s)`);
uiFiles.forEach(file => {
  console.log(`  - ${file.name}`);
});
