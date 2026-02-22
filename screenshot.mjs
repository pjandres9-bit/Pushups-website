/**
 * screenshot.mjs — Puppeteer screenshot utility
 * Usage: node screenshot.mjs <url> [label]
 * Saves to: ./temporary screenshots/screenshot-N[-label].png
 */
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const URL_ARG   = process.argv[2] || 'http://localhost:3000';
const LABEL_ARG = process.argv[3] || '';
const OUT_DIR   = 'temporary screenshots';

// Resolve puppeteer — try local node_modules first, then known path
let puppeteer;
const candidates = [
  () => require('puppeteer'),
  () => require('C:/Users/nateh/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer'),
  () => require('C:/Users/pjand/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer'),
];
for (const load of candidates) {
  try { puppeteer = load(); break; } catch {}
}
if (!puppeteer) {
  console.error('[screenshot] Could not find puppeteer. Run: npm install puppeteer');
  process.exit(1);
}

// Auto-increment filename
function nextFilename() {
  const existing = existsSync(OUT_DIR)
    ? readdirSync(OUT_DIR).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
    : [];
  const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(Boolean);
  const n = nums.length ? Math.max(...nums) + 1 : 1;
  const label = LABEL_ARG ? `-${LABEL_ARG}` : '';
  return `screenshot-${n}${label}.png`;
}

(async () => {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR);
  const filename = nextFilename();
  const outPath  = join(OUT_DIR, filename);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: existsSync('C:/Users/nateh/.cache/puppeteer/chrome')
      ? undefined
      : undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL_ARG, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 400)); // allow animations to settle
  await page.screenshot({ path: outPath, fullPage: true });

  await browser.close();
  console.log(`[screenshot] Saved → ${outPath}`);
})();
