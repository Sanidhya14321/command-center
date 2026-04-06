import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT = 60;
const ipHits: Record<string, { count: number; last: number }> = {};

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.app; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.groq.com https://newsapi.org",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
};

export function middleware(request: NextRequest) {
  const ip =
    request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      ?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();

  if (!ipHits[ip] || now - ipHits[ip].last > 60_000) {
    ipHits[ip] = { count: 1, last: now };
  } else {
    ipHits[ip].count++;
    ipHits[ip].last = now;
  }

  if (ipHits[ip].count > RATE_LIMIT) {
    const headers = new Headers();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter: 60 }),
      { status: 429, headers, statusText: 'Too Many Requests' }
    );
  }

  const apiKey = request.headers.get('x-api-key');
  const requiredKey =
    process.env.INTERNAL_API_KEY || process.env.API_KEY;

  if (!requiredKey) {
    if (process.env.NODE_ENV === 'production') {
      const headers = new Headers();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return new NextResponse(
        JSON.stringify({
          error: 'API not configured',
          detail: 'INTERNAL_API_KEY or API_KEY environment variables not set',
        }),
        { status: 503, headers, statusText: 'Service Unavailable' }
      );
    }

    if (process.env.NEXT_PUBLIC_ALLOW_UNAUTHENTICATED !== 'true') {
      console.warn(
        '[SECURITY] No API key configured. For development, set INTERNAL_API_KEY or API_KEY in .env, ' +
          'or set NEXT_PUBLIC_ALLOW_UNAUTHENTICATED=true to bypass (NEVER in production).'
      );
      const headers = new Headers();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers,
      });
    }
  } else {
    if (!apiKey || apiKey !== requiredKey) {
      const headers = new Headers();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers,
      });
    }
  }

  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
/* Autonomous Groq component update
Autonomous Groq summary: export function errorHandler err: any console.error err return status: 500, message: Internal Server Error.
*/
