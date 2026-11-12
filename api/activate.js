// GET /api/activate?session_id=cs_… – called by /premium after Checkout; sets the Premium cookie.
import {configured, stripe, json, fail, sessionCookie} from './_lib.js';

export async function GET(request) {
  if (!configured()) return json({premium: false}, 503);
  const id = new URL(request.url).searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return json({premium: false, error: 'Unknown checkout.'}, 400);
  try {
    const s = await stripe('GET', '/checkout/sessions/' + id);
    if (s.status !== 'complete' || !s.customer) return json({premium: false, error: 'The payment is not finished yet.'}, 402);
    return json({premium: true}, 200, {'Set-Cookie': sessionCookie({c: s.customer, ok: true, at: Date.now()})});
  } catch (err) {
    return fail(err);
  }
}
