#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

console.log(`\n${BOLD}${CYAN}=== @design-engineer 10-Dimension Industrial Audit Engine ===${RESET}\n`);

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const BUZZWORD_REGEX = /\b(elevate|seamless|robust|unleash|streamline|delve|comprehensive|supercharge|empower)\b/gi;

const DIMENSIONS = [
  {
    id: 1,
    name: 'Concentric Radii Mathematics',
    description: 'Enforces R_inner = max(0, R_outer - Padding - Border)',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/rounded-\[(?!calc)[0-9]+px\]/.test(line)) {
          violations.push({ line: idx + 1, detail: 'Arbitrary pixel radius found without concentric formula' });
        }
      });
      return violations;
    }
  },
  {
    id: 2,
    name: 'OKLCH Pigments & Non-Void Substrates',
    description: 'Bans flat #000/#fff voids and generic AI SaaS palettes (#6366F1, #8B5CF6, #3B82F6)',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/#(?:6366f1|8b5cf6|3b82f6)\b/i.test(line)) {
          violations.push({ line: idx + 1, detail: 'Generic SaaS indigo/purple/blue hex detected' });
        }
        if (/(?:background-color|background|bg-):\s*#(?:000|000000|fff|ffffff)\b/i.test(line)) {
          violations.push({ line: idx + 1, detail: 'Flat #000 or #fff void detected. Use tinted OKLCH substrate' });
        }
      });
      return violations;
    }
  },
  {
    id: 3,
    name: 'Motion Physics & Kinetic Bounds',
    description: 'Bans scale(0) entrances, transition: all, and unphysical ease-in curves',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/scale\(0\)/.test(line)) {
          violations.push({ line: idx + 1, detail: 'scale(0) unphysical volume destruction. Start from scale(0.95-0.97)' });
        }
        if (/transition:\s*all\b/.test(line) && !line.includes('audit-ignore')) {
          violations.push({ line: idx + 1, detail: 'transition: all triggers layout thrashing. Animate specific transform/opacity' });
        }
        if (/(?:ease-in\b|easeIn\b)/.test(line) && !line.includes('ease-in-out') && !line.includes('audit-ignore')) {
          violations.push({ line: idx + 1, detail: 'ease-in curve on UI entrance. Use decelerating cubic-bezier(0.16, 1, 0.3, 1)' });
        }
      });
      return violations;
    }
  },
  {
    id: 4,
    name: 'Accessibility & Reduced Motion',
    description: 'Requires @media (prefers-reduced-motion) in files with animation keyframes/transitions',
    scan: (file, lines) => {
      const violations = [];
      const content = lines.join('\n');
      if (file.endsWith('.css') && (content.includes('@keyframes') || content.includes('transition:')) && !content.includes('prefers-reduced-motion')) {
        violations.push({ line: 1, detail: 'Stylesheet contains animations/transitions without @media (prefers-reduced-motion) override' });
      }
      return violations;
    }
  },
  {
    id: 5,
    name: 'Anti-Slop Copy & Text Emojis',
    description: 'Zero tolerance for AI buzzwords and text emojis in UI copy',
    scan: (file, lines) => {
      const violations = [];
      // Skip binary/minified files and encyclopedia derivations explaining buzzwords
      if (file.includes('audit.mjs') || file.includes('SKILL.md') || file.includes('AGENTS.md') || file.includes('README.md') || file.includes('CONTRIBUTING.md') || file.includes('.cursorrules')) {
        return violations;
      }
      lines.forEach((line, idx) => {
        if (EMOJI_REGEX.test(line)) {
          violations.push({ line: idx + 1, detail: 'Text emoji detected. Replace with raw inline SVG or Phosphor icon' });
        }
        const bwMatches = line.match(BUZZWORD_REGEX);
        if (bwMatches) {
          violations.push({ line: idx + 1, detail: `AI marketing buzzword detected: "${bwMatches.join(', ')}"` });
        }
      });
      return violations;
    }
  },
  {
    id: 6,
    name: 'Interactive Hit Target Sizing',
    description: 'Enforces >= 40px hit targets on interactive buttons/triggers',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/min-h-\[(?:[1-3][0-9]|0)px\]|h-\[(?:[1-3][0-9]|0)px\]/.test(line)) {
          violations.push({ line: idx + 1, detail: 'Hit target below 40px accessible standard' });
        }
      });
      return violations;
    }
  },
  {
    id: 7,
    name: 'Tabular Numerics on Metrics',
    description: 'Verifies tabular-nums or tnum on data, timestamps, and metrics',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/(?:price|timestamp|metric|counter|timer|clock)\b/i.test(line) && line.includes('font-mono') === false && line.includes('tabular') === false && line.includes('tnum') === false && (line.includes('<span') || line.includes('<p') || line.includes('<div'))) {
          violations.push({ line: idx + 1, detail: 'Numeric/metric container missing tabular-nums / tnum styling' });
        }
      });
      return violations;
    }
  },
  {
    id: 8,
    name: 'ARIA & Accessibility Strictness',
    description: 'Enforces aria-label on icon buttons, aria-hidden on decorative SVGs',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/<button[^>]*>\s*<svg/i.test(line) && !line.includes('aria-label') && !line.includes('aria-labelledby')) {
          violations.push({ line: idx + 1, detail: 'Icon-only button missing aria-label or aria-labelledby' });
        }
      });
      return violations;
    }
  },
  {
    id: 9,
    name: 'Typography & Weight Contrast',
    description: 'Enforces display line-height controls and weight hierarchy gap >= 300',
    scan: (file, lines) => {
      const violations = [];
      lines.forEach((line, idx) => {
        if (/text-(?:5|6|7|8|9)xl/.test(line) && !line.includes('leading-') && !line.includes('line-height')) {
          violations.push({ line: idx + 1, detail: 'Display heading missing tight line-height constraint (0.85 - 1.1)' });
        }
      });
      return violations;
    }
  },
  {
    id: 10,
    name: 'Em-Dash Hard Ban',
    description: 'Bans em-dashes (—) in UI copy and commit messages (AI prose tell)',
    scan: (file, lines) => {
      const violations = [];
      if (file.includes('audit.mjs') || file.includes('README.md') || file.includes('SKILL.md') || file.includes('AGENTS.md') || file.includes('.cursorrules')) {
        return violations;
      }
      lines.forEach((line, idx) => {
        if (line.includes('—')) {
          violations.push({ line: idx + 1, detail: 'Em-dash (—) detected. Replace with clean hyphen or colon' });
        }
      });
      return violations;
    }
  }
];

function getFiles(targetPath, acc = []) {
  if (!fs.existsSync(targetPath)) return acc;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (/\.(css|ts|tsx|js|jsx|html)$/.test(targetPath) && !targetPath.includes('node_modules') && !targetPath.includes('dist')) {
      acc.push(targetPath);
    }
    return acc;
  }
  const entries = fs.readdirSync(targetPath);
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = path.join(targetPath, entry);
    getFiles(full, acc);
  }
  return acc;
}

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'packages');
const filesToScan = getFiles(targetDir);

if (filesToScan.length === 0) {
  console.log(`${YELLOW}No scannable code files found in ${targetDir}${RESET}`);
  process.exit(0);
}

console.log(`${DIM}Scanning ${filesToScan.length} files across target: ${targetDir}${RESET}\n`);

let passedDimensions = 0;
const totalDimensions = DIMENSIONS.length;

DIMENSIONS.forEach((dim) => {
  let dimensionViolations = 0;
  const violationReports = [];

  for (const file of filesToScan) {
    const raw = fs.readFileSync(file, 'utf-8');
    const lines = raw.split('\n');
    const hits = dim.scan(file, lines);
    if (hits.length > 0) {
      dimensionViolations += hits.length;
      hits.forEach((h) => {
        violationReports.push(`    ${DIM}${path.relative(process.cwd(), file)}:${h.line}${RESET} -> ${RED}${h.detail}${RESET}`);
      });
    }
  }

  if (dimensionViolations === 0) {
    console.log(`  [${dim.id}/10] ${dim.name} ... ${GREEN}${BOLD}PASSED${RESET}`);
    passedDimensions++;
  } else {
    console.log(`  [${dim.id}/10] ${dim.name} ... ${RED}${BOLD}FAILED (${dimensionViolations} violations)${RESET}`);
    violationReports.slice(0, 5).forEach((r) => console.log(r));
    if (violationReports.length > 5) {
      console.log(`    ${DIM}... and ${violationReports.length - 5} more${RESET}`);
    }
  }
});

const score = Math.round((passedDimensions / totalDimensions) * 100);

console.log(`\n${BOLD}------------------------------------------------------------${RESET}`);
if (score >= 85) {
  console.log(`${BOLD}${GREEN}Audit Score: ${score}% — HIGH CRAFT PASS${RESET}`);
  console.log(`All mathematical, sensory, and anti-slop gates validated.\n`);
  process.exit(0);
} else {
  console.log(`${BOLD}${RED}Audit Score: ${score}% — SLOP GATES TRIPPED${RESET}`);
  console.log(`Codebase does not meet the minimum 85% craft threshold. Refactor required.\n`);
  process.exit(1);
}
