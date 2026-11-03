/**
 * Shifrlangan sessiya tokeni (AES-256-GCM, Web Crypto).
 * Nima uchun: serverless muhitda xotira saqlanmaydi; holatni mijozga ochiq bersak, u to'g'ri
 * javobni ko'rib qoladi yoki holatni soxtalashtiradi. Shifrlangan token ikkalasini ham oldini oladi.
 */
const enc = new TextEncoder();
const dec = new TextDecoder();
const MAX_TOKEN = 12_000;
const TTL_MS = 2 * 60 * 60 * 1000;

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

export async function importSessionKey(secret: string | undefined): Promise<CryptoKey> {
  let raw: Uint8Array;
  if (secret && secret.length >= 32) {
    raw = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(secret)));
  } else {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production')
      console.warn('TUTOR_SESSION_SECRET berilmagan — har bir ishga tushishda vaqtinchalik kalit ishlatiladi.');
    raw = crypto.getRandomValues(new Uint8Array(32));
  }
  return crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function sealSession(key: CryptoKey, state: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = enc.encode(JSON.stringify({ exp: Date.now() + TTL_MS, state }));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload));
  return `${b64url(iv)}.${b64url(ct)}`;
}

export async function openSession<T>(key: CryptoKey, token: string): Promise<T | null> {
  if (token.length > MAX_TOKEN) return null;
  const [ivs, cts] = token.split('.');
  if (!ivs || !cts) return null;
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64url(ivs) as BufferSource }, key, fromB64url(cts) as BufferSource);
    const obj = JSON.parse(dec.decode(pt)) as { exp: number; state: T };
    if (typeof obj.exp !== 'number' || obj.exp < Date.now()) return null;
    return obj.state;
  } catch {
    return null;
  }
}
