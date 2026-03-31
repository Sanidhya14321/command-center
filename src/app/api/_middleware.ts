import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (per IP, per minute)
const RATE_LIMIT = 60; // requests per minute
const ipHits: Record<string, { count: number; last: number }> = {};

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
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

  // Simple API key check (set NEXT_PUBLIC_API_KEY in env for demo)
  const apiKey = request.headers.get('x-api-key');
  const requiredKey = process.env.NEXT_PUBLIC_API_KEY;
  if (requiredKey && apiKey !== requiredKey) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}