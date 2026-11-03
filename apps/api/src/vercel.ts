// Vercel Node funksiyasi uchun kirish nuqtasi (scripts/vercel-build.mjs tomonidan esbuild bilan to'plangan).
import { getRequestListener } from '@hono/node-server';
import { app } from './index';

export default getRequestListener(app.fetch);
