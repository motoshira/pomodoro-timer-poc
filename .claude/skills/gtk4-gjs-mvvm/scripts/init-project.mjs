#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_ROOT = dirname(__dirname);
const TEMPLATE_DIR = join(SKILL_ROOT, 'assets', 'hello-world');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: init-project.mjs <project-name> [target-directory]');
  console.error('Example: init-project.mjs my-app ~/projects/my-app');
  process.exit(1);
}

const projectName = args[0];
const targetDir = args[1] || join(process.cwd(), projectName);

// Validate project name
if (!/^[a-z0-9-]+$/.test(projectName)) {
  console.error('Error: Project name must contain only lowercase letters, numbers, and hyphens');
  process.exit(1);
}

console.log(`\n🚀 Initializing GTK4+GJS project: ${projectName}`);
console.log(`   Location: ${targetDir}\n`);

// Copy directory recursively
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Replace placeholders in file
function replacePlaceholders(filePath, replacements) {
  let content = readFileSync(filePath, 'utf-8');

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(key, 'g'), value);
  }

  writeFileSync(filePath, content, 'utf-8');
}

try {
  // Copy template
  console.log('📁 Copying template files...');
  copyDir(TEMPLATE_DIR, targetDir);

  // Define replacements
  const appId = `org.example.${projectName.replace(/-/g, '')}`;
  const gresourceName = projectName.replace(/-/g, '');
  const titleCase = projectName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const replacements = {
    'gtk4-gjs-hello-world': projectName,
    'HelloWorld': titleCase.replace(/\s/g, ''),
    'helloworld': gresourceName,
    'Hello World': titleCase,
    'org.example.HelloWorld': appId,
    'org.example.helloworld': appId.toLowerCase(),
    'org/example/helloworld': appId.toLowerCase().replace(/\./g, '/'),
  };

  // Update package.json
  console.log('📦 Updating package.json...');
  const packageJsonPath = join(targetDir, 'package.json');
  replacePlaceholders(packageJsonPath, replacements);

  // Update main.ts
  console.log('📝 Updating main.ts...');
  const mainTsPath = join(targetDir, 'main.ts');
  replacePlaceholders(mainTsPath, replacements);

  // Update resource files
  console.log('🎨 Updating resource files...');
  const resourceTemplate = join(targetDir, 'resources', 'helloworld.gresource.xml.mustache');
  const newResourceTemplate = join(targetDir, 'resources', `${gresourceName}.gresource.xml.mustache`);
  const resourceScript = join(targetDir, 'scripts', 'generate-gresource-xml.mjs');
  const compileScript = join(targetDir, 'scripts', 'compile-resources.sh');

  replacePlaceholders(resourceTemplate, replacements);
  replacePlaceholders(resourceScript, replacements);
  replacePlaceholders(compileScript, replacements);

  // Rename resource template
  if (resourceTemplate !== newResourceTemplate) {
    copyFileSync(resourceTemplate, newResourceTemplate);
    const fs = await import('fs');
    fs.unlinkSync(resourceTemplate);
  }

  // Update UI files
  console.log('🖼️  Updating UI files...');
  const uiFiles = readdirSync(join(targetDir, 'src', 'views', 'MainWindow')).filter(f => f.endsWith('.ui'));
  for (const uiFile of uiFiles) {
    const uiPath = join(targetDir, 'src', 'views', 'MainWindow', uiFile);
    replacePlaceholders(uiPath, replacements);
  }

  // Update TypeScript files
  console.log('💻 Updating TypeScript files...');
  const tsFiles = [
    join(targetDir, 'src', 'views', 'MainWindow', 'MainWindow.ts'),
    join(targetDir, 'src', 'views', 'MainWindow', 'CounterViewModel.ts'),
    join(targetDir, 'src', 'init-resources.ts'),
  ];

  for (const tsFile of tsFiles) {
    replacePlaceholders(tsFile, replacements);
  }

  // Update README
  console.log('📄 Updating README...');
  const readmePath = join(targetDir, 'README.md');
  replacePlaceholders(readmePath, {
    'GTK4+GJS Hello World - MVVM Pattern': `${titleCase} - GTK4+GJS MVVM`,
    'hello-world': projectName,
  });

  // Initialize git repository
  console.log('🔧 Initializing git repository...');
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    console.log('✓ Git repository initialized');
  } catch (err) {
    console.log('⚠ Failed to initialize git repository (git may not be installed)');
  }

  // Install dependencies
  console.log('\n📥 Installing dependencies...');
  console.log('   This may take a few minutes...\n');
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
    console.log('\n✓ Dependencies installed');
  } catch (err) {
    console.log('\n⚠ Failed to install dependencies. Run "npm install" manually.');
  }

  // Success message
  console.log(`\n✅ Project ${projectName} created successfully!\n`);
  console.log('Next steps:');
  console.log(`  cd ${targetDir}`);
  console.log('  npm start\n');
  console.log('Available commands:');
  console.log('  npm start       - Build and run the application');
  console.log('  npm test        - Run tests');
  console.log('  npm run build   - Build the application');
  console.log('  npm run lint    - Lint and format code\n');
  console.log('Documentation:');
  console.log('  See README.md for project structure and conventions');
  console.log('  See gtk4-gjs-mvvm skill for detailed development guide\n');

} catch (err) {
  console.error('\n❌ Error creating project:', err.message);
  process.exit(1);
}
