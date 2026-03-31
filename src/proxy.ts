import { NextRequest } from 'next/server';
import { middleware as apiMiddleware } from './app/api/_middleware';

export function proxy(request: NextRequest) {
  return apiMiddleware(request);
}

export const config = {
  matcher: ['/api/:path*'],
};
