// POST /api/cancel – the "Verträge hier kündigen" button (§ 312k BGB).
// Ends every active Premium subscription of that email at the end of the paid period.
import {configured, stripe, json, fail} from './_lib.js';

export async function POST(request) {
  if (!configured()) return json({error: 'Es gibt noch keine Premium-Verträge.'}, 503);
  let body = {};
  try { body = await request.json(); } catch {}
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error: 'Bitte gib die E-Mail-Adresse an, mit der du Premium gebucht hast.'}, 400);
  const received = new Date().toISOString();
  try {
    const customers = await stripe('GET', '/customers', {email, limit: 10});
    let ends = null;
    for (const c of customers.data) {
      const subs = await stripe('GET', '/subscriptions', {customer: c.id, status: 'active', limit: 10});
      for (const s of subs.data) {
        const updated = await stripe('POST', '/subscriptions/' + s.id, {cancel_at_period_end: true});
        const end = updated.cancel_at || updated.current_period_end || updated.items?.data?.[0]?.current_period_end;
        if (end && (!ends || end > ends)) ends = end;
      }
    }
    console.log('cancellation', {email, received, found: Boolean(ends)});
    return json({received, ends: ends ? new Date(ends * 1000).toISOString() : null});
  } catch (err) {
    return fail(err);
  }
}
