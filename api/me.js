// GET /api/me – is this browser a Premium member? Re-checks Stripe every few hours.
import {configured, readSession, needsRecheck, activeSubscription, sessionCookie, clearedCookie, json} from './_lib.js';

export async function GET(request) {
  if (!configured()) return json({premium: false, checkout: false});
  const session = readSession(request);
  if (!session) return json({premium: false, checkout: true});
  if (!needsRecheck(session)) return json({premium: session.ok, checkout: true, member: true});
  try {
    const sub = await activeSubscription(session.c);
    const fresh = {c: session.c, ok: Boolean(sub), at: Date.now()};
    return json({premium: fresh.ok, checkout: true, member: true}, 200, {'Set-Cookie': sessionCookie(fresh)});
  } catch (err) {
    // Stripe unreachable: keep the last known state instead of locking a paying member out.
    console.error(err);
    return json({premium: session.ok, checkout: true, member: true});
  }
}

export function DELETE() {
  return json({premium: false}, 200, {'Set-Cookie': clearedCookie()});
}
