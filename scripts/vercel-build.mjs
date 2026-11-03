/**
 * Vercel Build Output API (v3): web ilova (Expo static export) + API funksiyasi bitta deploy'da.
 * Nima uchun Build Output API: workspace paketlari TypeScript manbada; Vercel'ning standart
 * /api aniqlashi ularni kompilyatsiya qilmaydi. Biz o'zimiz esbuild bilan bitta faylga to'playmiz.
 */
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

const OUT = '.vercel/output';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/static`, { recursive: true });

const env = { ...process.env, EXPO_PUBLIC_DEMO_CONTENT: process.env.EXPO_PUBLIC_DEMO_CONTENT ?? 'true', CI: '1' };
execSync('pnpm content:check', { stdio: 'inherit', env });
execSync('pnpm --filter bilimjon build:web', { stdio: 'inherit', env });
cpSync('apps/bilimjon/dist', `${OUT}/static`, { recursive: true });

const fn = `${OUT}/functions/api.func`;
mkdirSync(fn, { recursive: true });
await build({
  entryPoints: ['apps/api/src/vercel.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: `${fn}/index.mjs`,
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
  logLevel: 'info',
});
writeFileSync(`${fn}/package.json`, JSON.stringify({ type: 'module' }));
writeFileSync(
  `${fn}/.vc-config.json`,
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false, maxDuration: 10 }, null, 2),
);

const common = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Frame-Options': 'DENY',
};
const appCsp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'";
// Eski v0.1 demo inline skriptlardan foydalanadi — faqat shu yo'l uchun yumshoqroq CSP.
const legacyCsp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'";

writeFileSync(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '/demo/(.*)', headers: { ...common, 'Content-Security-Policy': legacyCsp }, continue: true },
        { src: '/((?!demo/).*)', headers: { ...common, 'Content-Security-Policy': appCsp }, continue: true },
        { src: '/_expo/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
        { src: '/api/(.*)', dest: '/api' },
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);
console.log('✅ .vercel/output tayyor');
