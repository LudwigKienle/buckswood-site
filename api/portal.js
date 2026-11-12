// POST /api/portal – opens the Stripe customer portal (invoices, payment method, cancel).
import {configured, readSession, stripe, json, fail, SITE} from './_lib.js';

export async function POST(request) {
  if (!configured()) return json({error: 'Premium is not open yet.'}, 503);
  const session = readSession(request);
  if (!session) return json({error: 'No Premium membership in this browser.'}, 401);
  try {
    const portal = await stripe('POST', '/billing_portal/sessions', {customer: session.c, return_url: SITE + '/premium'});
    return json({url: portal.url});
  } catch (err) {
    return fail(err);
  }
}
