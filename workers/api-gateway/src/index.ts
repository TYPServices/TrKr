/**
 * TrKr API Gateway — Cloudflare Worker
 *
 * Sits between the TrKr app and Supabase, adding:
 *   1. Rate limiting  — 60 req/min per IP (in-memory MVP; upgrade to Durable Objects for multi-region)
 *   2. Response caching — 5-minute cache for GET requests via Cloudflare Cache API
 *   3. Proxy         — forwards requests to Supabase with auth headers preserved
 *
 * Deploy:
 *   cd workers/api-gateway
 *   npm install
 *   wrangler secret put SUPABASE_URL        # e.g. https://noyicqzdyqtikozfwokm.supabase.co
 *   wrangler secret put SUPABASE_ANON_KEY   # your anon/public key
 *   wrangler deploy
 *
 * Then update EXPO_PUBLIC_SUPABASE_URL in .env to your Worker URL.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const RATE_LIMIT = 60;             // requests allowed per window
const RATE_WINDOW_MS = 60_000;     // 1 minute window
const CACHE_TTL_SECONDS = 300;     // 5-minute GET cache

// In-memory rate limit store — MVP. Resets on cold start.
// Production upgrade path: use a Durable Object with atomic counters.
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);

  if (!record || now > record.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT) return true;

  record.count++;
  return false;
}

function rateLimitResponse(): Response {
  return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: 60 }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // ── CORS preflight ────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, prefer',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // ── Rate limiting ─────────────────────────────────────
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (isRateLimited(ip)) return rateLimitResponse();

    // ── Cache check (GET only) ────────────────────────────
    const cache = caches.default;
    if (request.method === 'GET') {
      const cached = await cache.match(request);
      if (cached) {
        const res = new Response(cached.body, cached);
        res.headers.set('X-Cache', 'HIT');
        res.headers.set('Access-Control-Allow-Origin', '*');
        return res;
      }
    }

    // ── Proxy to Supabase ─────────────────────────────────
    const supabaseUrl = new URL(env.SUPABASE_URL);
    const incomingUrl = new URL(request.url);

    // Replace hostname with Supabase's
    incomingUrl.hostname = supabaseUrl.hostname;
    incomingUrl.protocol = supabaseUrl.protocol;
    incomingUrl.port = supabaseUrl.port;

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('apikey', env.SUPABASE_ANON_KEY);
    proxyHeaders.set('Access-Control-Allow-Origin', '*');

    const proxied = new Request(incomingUrl.toString(), {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    const response = await fetch(proxied);

    // ── Cache successful GET responses ────────────────────
    if (request.method === 'GET' && response.status === 200) {
      const toCache = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
      toCache.headers.set('Cache-Control', `public, s-maxage=${CACHE_TTL_SECONDS}`);
      toCache.headers.set('X-Cache', 'MISS');
      toCache.headers.set('Access-Control-Allow-Origin', '*');
      ctx.waitUntil(cache.put(request, toCache.clone()));
      return toCache;
    }

    // Pass through non-cacheable responses
    const passthrough = new Response(response.body, response);
    passthrough.headers.set('Access-Control-Allow-Origin', '*');
    return passthrough;
  },
} satisfies ExportedHandler<Env>;
