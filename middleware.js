// Vercel Routing Middleware — runs before static file resolution, so it's
// the only reliable place to split crawler traffic from human traffic here.
// (vercel.json rewrites for "/", "/news" and "/interviews" silently lose to
// the static index.html at those exact paths — confirmed live; only
// "/article/:slug" ever actually reached its /api function, and it did so
// for humans too, costing a function invocation + a self-fetch of
// index.html on every single article pageview.)
//
// Crawlers (Googlebot, Mediapartners-Google, social preview bots, etc.) get
// rewritten to the matching /api/* function for real meta tags / SEO
// content. Everyone else falls through untouched to the static SPA shell —
// zero function invocation, zero cost.
import { rewrite, next } from '@vercel/functions';

const CRAWLER_RE = /facebookexternalhit|twitterbot|slackbot|telegrambot|whatsapp|linkedinbot|discordbot|pinterestbot|googlebot|mediapartners-google|adsbot-google|apis-google|storebot-google/i;

export const config = {
  matcher: ['/', '/news', '/interviews', '/article/:slug'],
};

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!CRAWLER_RE.test(userAgent)) return next();

  const url = new URL(request.url);

  if (url.pathname === '/') return rewrite(new URL('/api/home', request.url));
  if (url.pathname === '/news') return rewrite(new URL('/api/news', request.url));
  if (url.pathname === '/interviews') return rewrite(new URL('/api/interviews', request.url));
  if (url.pathname.startsWith('/article/')) {
    const slug = url.pathname.slice('/article/'.length);
    return rewrite(new URL(`/api/article/${slug}`, request.url));
  }

  return next();
}
