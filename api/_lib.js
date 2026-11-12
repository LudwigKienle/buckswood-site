// Shared helpers for the Premium functions. Files starting with "_" are not routes.
// Environment (Vercel → Project → Settings → Environment Variables):
//   STRIPE_SECRET_KEY   sk_test_… while testing, sk_live_… for real payments
//   STRIPE_PRICE_ID     price_… of the "Buckswood Premium" monthly price
//   SESSION_SECRET      long random string that signs the Premium cookie
//   STRIPE_AUTOMATIC_TAX=1   optional, only once Stripe Tax is set up
//   STRIPE_TOS_CONSENT=1     optional, required terms checkbox (needs terms URL in Stripe)
import crypto from 'node:crypto';

export const SITE = process.env.SITE_URL || 'https://www.buckswood.art';
const COOKIE = 'bw_premium';
const RECHECK_MS = 6 * 3600 * 1000; // ask Stripe again after six hours

export function configured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && process.env.SESSION_SECRET);
}

// Stripe expects form encoding with bracketed keys: line_items[0][price]=…
function encode(obj, prefix, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') encode(v, key, out);
    else out.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v)));
  }
  return out;
}

export async function stripe(method, path, params) {
  const query = params ? encode(params).join('&') : '';
  const res = await fetch('https://api.stripe.com/v1' + path + (method === 'GET' && query ? '?' + query : ''), {
    method,
    headers: {
      Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
      ...(method === 'GET' ? {} : {'Content-Type': 'application/x-www-form-urlencoded'})
    },
    body: method === 'GET' ? undefined : query
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error?.message || 'Stripe request failed'), {status: res.status});
  return data;
}

export async function activeSubscription(customer) {
  const list = await stripe('GET', '/subscriptions', {customer, status: 'all', limit: 10});
  return list.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status)) || null;
}

// Signed cookie: base64url(JSON).hmac — holds the Stripe customer and the last check.
function sign(data) {
  const body = Buffer.from(JSON.stringify(data)).toString('base64url');
  const mac = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(body).digest('base64url');
  return body + '.' + mac;
}
function verify(token) {
  const [body, mac] = (token || '').split('.');
  if (!body || !mac) return null;
  const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(body).digest('base64url');
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
}

export function readSession(request) {
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)bw_premium=([^;]+)/);
  return m ? verify(decodeURIComponent(m[1])) : null;
}
export function sessionCookie(data) {
  return `${COOKIE}=${sign(data)}; Path=/; Max-Age=${400 * 86400}; HttpOnly; Secure; SameSite=Lax`;
}
export function clearedCookie() {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
export function needsRecheck(session) {
  return !session.at || Date.now() - session.at > RECHECK_MS;
}

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers}
  });
}
export function fail(err) {
  console.error(err);
  return json({error: 'Something went wrong with the payment service. Please try again in a moment.'}, 502);
}
