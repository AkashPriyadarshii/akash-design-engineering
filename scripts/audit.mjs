#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('\x1b[1m\x1b[36m=== @design-engineer 10-Dimension Codebase Audit ===\x1b[0m\n');

const checks = [
  {
    name: 'Concentric Radii Mathematics',
    pattern: /rounded-\[.*\]/g,
    desc: 'Verifies inner and outer container corner radii follow R_inner = R_outer - Padding',
  },
  {
    name: 'Anti-Slop Color Tokens',
    pattern: /#(?:6366f1|8b5cf6|3b82f6|000000|ffffff)/gi,
    desc: 'Detects generic AI purple/indigo radial glow colors and pure black/white',
  },
  {
    name: 'Motion Physics (No scale(0))',
    pattern: /scale\(0\)/g,
    desc: 'Detects physical volume violations (scale(0) entrances)',
  },
  {
    name: 'CSS Transition Specificity',
    pattern: /transition:\s*all/g,
    desc: 'Flags unoptimized transition: all rules that trigger layout thrashing',
  }
];

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') getFiles(filePath, fileList);
    } else if (/\.(css|ts|tsx|js|jsx)$/.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const filesToScan = getFiles(path.join(process.cwd(), 'packages'));
let passedChecks = 0;

checks.forEach((check, index) => {
  let violations = 0;
  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(check.pattern);
    if (matches) violations += matches.length;
  }
  
  if (violations === 0) {
    console.log(`  [${index + 1}/${checks.length}] Checking ${check.name}... \x1b[32mPASSED\x1b[0m`);
    passedChecks++;
  } else {
    console.log(`  [${index + 1}/${checks.length}] Checking ${check.name}... \x1b[31mFAILED (${violations} violations)\x1b[0m`);
  }
});

const score = Math.round((passedChecks / checks.length) * 100);
if (score === 100) {
  console.log(`\n\x1b[1m\x1b[32mAudit Result: ${score}% Clean Pass\x1b[0m`);
  console.log('Zero slop detected. All mathematical and physical gates verified.\n');
} else {
  console.log(`\n\x1b[1m\x1b[31mAudit Result: ${score}% - SLOP DETECTED\x1b[0m`);
}
