/**
 * Post-build prerender script.
 * Starts vite preview, renders each route with puppeteer, saves static HTML to dist/.
 *
 * Run after `vite build`:
 *   node scripts/prerender.mjs
 *
 * Or use the combined script:
 *   npm run build:ssr
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Routes to pre-render (dynamic article routes are handled by Googlebot's JS rendering)
const ROUTES = [
  '/',
  '/news',
  '/interviews',
  '/about',
  '/submit-music',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
  '/dmca',
];

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    let resolved = false;
    const tryResolve = () => {
      if (!resolved) { resolved = true; resolve(server); }
    };

    server.stdout.on('data', (d) => {
      if (d.toString().includes('localhost')) tryResolve();
    });
    server.on('error', reject);

    // Fallback: give it 4s to start
    setTimeout(tryResolve, 4000);
  });
}

async function prerender() {
  // Lazy-load puppeteer so missing it doesn't break non-SSR builds
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.error('puppeteer not installed. Run: npm install --save-dev puppeteer');
    process.exit(1);
  }

  console.log('Starting preview server...');
  const server = await startPreviewServer();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();

      // Suppress console noise from the page
      page.on('console', () => {});
      page.on('pageerror', () => {});

      console.log(`  Rendering ${route} ...`);
      await page.goto(`${BASE}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 30_000,
      });

      // Wait a bit extra for React to settle
      await new Promise(r => setTimeout(r, 500));

      const html = await page.content();

      const filePath = route === '/'
        ? join(distDir, 'index.html')
        : join(distDir, route.slice(1), 'index.html');

      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, html, 'utf-8');
      console.log(`  ✓ ${route}`);

      await page.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log('\nPre-rendering complete.');
}

prerender().catch(err => { console.error(err); process.exit(1); });
