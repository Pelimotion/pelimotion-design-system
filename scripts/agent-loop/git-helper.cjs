#!/usr/bin/env node

/**
 * Pelimotion Agent Loops - Git & Restoration Helper
 * This script automates creating, listing, and restoring points of recovery.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, '../../RESTORE_REGISTRY.md');

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\nError: ${err.message}`);
  }
}

function getLatestCommitHash() {
  return runCmd('git rev-parse --short HEAD');
}

function isWorkingCopyClean() {
  const status = runCmd('git status --porcelain');
  return status === '';
}

function createRestorePoint(description = 'Manual agent backup') {
  if (!isWorkingCopyClean()) {
    console.warn('\x1b[33mWarning: You have uncommitted changes in your workspace.\x1b[0m');
    console.log('Committing changes to main first before creating restore point...');
    try {
      runCmd('git add -A');
      runCmd(`git commit -m "auto: save point before restore point - ${description}"`);
    } catch (e) {
      console.log('No new changes to commit or commit failed. Continuing...');
    }
  }

  const hash = getLatestCommitHash();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const tagName = `restore-${timestamp}`;
  const branchName = `backup-branch-${timestamp}`;

  console.log(`Creating restore point: \x1b[36m${tagName}\x1b[0m at commit \x1b[32m${hash}\x1b[0m`);

  // Create git tag
  runCmd(`git tag -a ${tagName} -m "Restore point: ${description} (Commit: ${hash})"`);
  // Create backup branch
  runCmd(`git branch ${branchName} ${tagName}`);

  // Log to restore registry
  updateRegistry(tagName, branchName, hash, description);

  console.log(`\n\x1b[32mSuccess! Restore point created.\x1b[0m`);
  console.log(`- Git Tag: ${tagName}`);
  console.log(`- Backup Branch: ${branchName}`);
  console.log(`- Registry updated at: RESTORE_REGISTRY.md`);
}

function updateRegistry(tagName, branchName, hash, description) {
  const dateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const entry = `| **${tagName}** | \`${branchName}\` | \`${hash}\` | ${dateStr} | ${description} |\n`;

  let content = '';
  if (fs.existsSync(REGISTRY_PATH)) {
    content = fs.readFileSync(REGISTRY_PATH, 'utf8');
  } else {
    content = `# Pelimotion Restoration Registry\n\nEste arquivo registra todos os pontos de restauração criados pelos agentes.\n\n| Tag de Restauração | Branch de Backup | Hash Commit | Data/Hora (BR) | Descrição do Estado / Mudanças |\n| --- | --- | --- | --- | --- |\n`;
  }

  content += entry;
  fs.writeFileSync(REGISTRY_PATH, content, 'utf8');
}

function restoreToPoint(tagName) {
  if (!tagName) {
    console.error('\x1b[31mError: You must specify a tag to restore to.\x1b[0m');
    console.log('Usage: npm run agent:restore <tag-name>');
    process.exit(1);
  }

  // Check if tag exists
  let tags = [];
  try {
    tags = runCmd('git tag').split('\n');
  } catch (e) {
    console.error('Failed to retrieve git tags.');
    process.exit(1);
  }

  if (!tags.includes(tagName)) {
    console.error(`\x1b[31mError: Restore point tag "${tagName}" not found.\x1b[0m`);
    console.log('Available tags:');
    tags.forEach(t => console.log(` - ${t}`));
    process.exit(1);
  }

  if (!isWorkingCopyClean()) {
    console.error('\x1b[31mError: Cannot restore. Working directory has uncommitted changes.\x1b[0m');
    console.log('Please commit or stash your changes, or run git reset --hard if you want to discard them.');
    process.exit(1);
  }

  console.log(`Restoring workspace to tag: \x1b[36m${tagName}\x1b[0m...`);
  
  try {
    // We checkout the tag
    runCmd(`git checkout ${tagName}`);
    console.log(`\n\x1b[32mSuccess! Workspace is now at tag "${tagName}".\x1b[0m`);
    console.log(`Note: You are in a 'detached HEAD' state. You can view, test, and run the app.`);
    console.log(`To return to the main branch, run: \x1b[36mgit checkout main\x1b[0m`);
    console.log(`To create a new branch from this restore point, run: \x1b[36mgit checkout -b new-branch-name\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31mFailed to restore: ${err.message}\x1b[0m`);
  }
}

function listRestorePoints() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.log('No restore points registered yet. Run "npm run agent:backup" to create one.');
    return;
  }

  console.log(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

// CLI Routing
const args = process.argv.slice(2);
const command = args[0];

if (command === 'backup') {
  const descIndex = args.indexOf('--desc');
  const description = descIndex !== -1 && args[descIndex + 1] ? args[descIndex + 1] : undefined;
  createRestorePoint(description);
} else if (command === 'restore') {
  restoreToPoint(args[1]);
} else if (command === 'list') {
  listRestorePoints();
} else {
  console.log(`Pelimotion Git Restoration Helper CLI`);
  console.log(`Usage:`);
  console.log(`  node git-helper.js backup [--desc "description"]`);
  console.log(`  node git-helper.js list`);
  console.log(`  node git-helper.js restore <tag-name>`);
}
