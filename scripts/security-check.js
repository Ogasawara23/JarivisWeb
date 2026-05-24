/**
 * scripts/security-check.js
 *
 * Scans the codebase to ensure no real API keys (OpenAI, Brave),
 * local environment configurations, or sensitive files are leaked.
 */

const fs = require('fs');
const path = require('path');

const BLACKLIST_PATTERNS = [
  /sk-[a-zA-Z0-9]{48,}/, // Regex matching actual OpenAI keys
  /BSA_[a-zA-Z0-9]{30,}/, // Regex matching actual Brave keys
];

const FORBIDDEN_FILES = [
  '.env.local',
  '.env.production.local',
  '.env.development.local',
  'npm-debug.log',
  'yarn-error.log',
];

const SCAN_DIRS = ['app', 'components', 'lib', 'services', 'hooks', 'store', 'utils'];

let violations = 0;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip self
  if (filePath.endsWith('security-check.js')) return;

  BLACKLIST_PATTERNS.forEach((pattern) => {
    if (pattern.test(content)) {
      console.error(`\x1b[31m[ERRO DE SEGURANÇA] Chave exposta em: ${filePath}\x1b[0m`);
      violations++;
    }
  });
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'out' && file !== '.git') {
        traverseDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (['.js', '.ts', '.tsx', '.json', '.md'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  });
}

console.log('\x1b[36m🚀 Iniciando auditoria de segurança da JarvisWeb...\x1b[0m');

// 1. Check directory contents for forbidden environment files
FORBIDDEN_FILES.forEach((forbidden) => {
  const targetPath = path.join(__dirname, '..', forbidden);
  if (fs.existsSync(targetPath)) {
    console.warn(`\x1b[33m[AVISO] Arquivo local sensível presente: ${forbidden}. Certifique-se de que está no .gitignore!\x1b[0m`);
  }
});

// 2. Scan code files
SCAN_DIRS.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  traverseDirectory(dirPath);
});

// 3. Scan root configurations
const rootFiles = ['package.json', 'tsconfig.json', 'next.config.ts', 'tailwind.config.ts'];
rootFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    scanFile(filePath);
  }
});

if (violations > 0) {
  console.error(`\n\x1b[41m\x1b[37m Falha no check de segurança. Encontradas ${violations} violações de chave. \x1b[0m\n`);
  process.exit(1);
} else {
  console.log('\n\x1b[42m\x1b[30m Nenhum vazamento de credencial detectado. Projeto seguro para publicação! \x1b[0m\n');
  process.exit(0);
}
