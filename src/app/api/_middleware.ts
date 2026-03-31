import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (per IP, per minute)
const RATE_LIMIT = 60; // requests per minute
const ipHits: Record<string, { count: number; last: number }> = {};

export function middleware(request: NextRequest) {
  // NextRequest does not have an 'ip' property; use headers for IP detection
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  if (!ipHits[ip] || now - ipHits[ip].last > 60_000) {
    ipHits[ip] = { count: 1, last: now };
  } else {
    ipHits[ip].count++;
    ipHits[ip].last = now;
  }
  if (ipHits[ip].count > RATE_LIMIT) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  // API key check for server-to-server protection.
  // Do not use NEXT_PUBLIC_ variables for secrets.
  const apiKey = request.headers.get('x-api-key');
  const requiredKey = process.env.INTERNAL_API_KEY || process.env.API_KEY;
  if (requiredKey && apiKey !== requiredKey) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}