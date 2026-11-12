// POST /api/cancel – the "Verträge hier kündigen" button (§ 312k BGB).
// Ends every active Premium subscription of that email at the end of the paid period and
// confirms receipt by email. Mail goes only to addresses Stripe knows as customers, so the
// form cannot be used to send mail to strangers.
import {configured, stripe, json, fail} from './_lib.js';
import {mailConfigured, sendMail, escapeHtml, OWNER} from './_mail.js';

const TZ = {timeZone: 'Europe/Berlin'};

export async function POST(request) {
  if (!configured()) return json({error: 'Es gibt noch keine Premium-Verträge.'}, 503);
  let body = {};
  try { body = await request.json(); } catch {}
  const typed = String(body.email || '').trim();
  const name = String(body.name || '').trim().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typed)) return json({error: 'Bitte gib die E-Mail-Adresse an, mit der du Premium gebucht hast.'}, 400);
  const received = new Date();
  try {
    // Stripe matches emails exactly, so look up both the typed and the lower-case form.
    const seen = new Set(), customers = [];
    for (const email of new Set([typed, typed.toLowerCase()])) {
      const list = await stripe('GET', '/customers', {email, limit: 10});
      for (const c of list.data) if (!seen.has(c.id)) { seen.add(c.id); customers.push(c); }
    }
    let ends = null;
    for (const c of customers) {
      const subs = await stripe('GET', '/subscriptions', {customer: c.id, status: 'active', limit: 10});
      for (const s of subs.data) {
        const updated = await stripe('POST', '/subscriptions/' + s.id, {cancel_at_period_end: true});
        const end = updated.cancel_at || updated.current_period_end || updated.items?.data?.[0]?.current_period_end;
        if (end && (!ends || end > ends)) ends = end;
      }
    }

    let mailed = false;
    if (customers.length && mailConfigured()) {
      try {
        await sendMail({to: customers[0].email || typed, bcc: OWNER, ...confirmation({email: typed, name, received, ends})});
        mailed = true;
      } catch (err) {
        console.error('cancellation mail failed', err);
      }
    }
    console.log('cancellation', {email: typed, received: received.toISOString(), found: customers.length, active: Boolean(ends), mailed});
    return json({received: received.toISOString(), ends: ends ? new Date(ends * 1000).toISOString() : null, mailed});
  } catch (err) {
    return fail(err);
  }
}

function confirmation({email, name, received, ends}) {
  const at = received.toLocaleString('de-DE', {...TZ, dateStyle: 'long', timeStyle: 'short'}) + ' Uhr';
  const atEn = received.toLocaleString('en-GB', {...TZ, dateStyle: 'long', timeStyle: 'short'});
  const end = ends ? new Date(ends * 1000).toLocaleDateString('de-DE', {...TZ, dateStyle: 'long'}) : null;
  const endEn = ends ? new Date(ends * 1000).toLocaleDateString('en-GB', {...TZ, dateStyle: 'long'}) : null;
  const de = [
    `Hallo${name ? ' ' + name : ''},`,
    '',
    'wir haben deine Kündigung von Buckswood Premium erhalten.',
    '',
    `Eingang: ${at}`,
    `E-Mail-Adresse: ${email}`,
    'Kündigung zum: nächstmöglichen Zeitpunkt',
    end
      ? `Dein Abo endet am ${end}. Bis dahin bleibt Premium aktiv, danach wird nichts mehr abgebucht.`
      : 'Zu dieser E-Mail-Adresse war kein laufendes Premium-Abo mehr aktiv. Es wird nichts mehr abgebucht.',
    '',
    'Bitte bewahre diese E-Mail als Bestätigung auf. Bei Fragen antworte einfach auf diese Nachricht.'
  ];
  const en = [
    'We received your cancellation of Buckswood Premium.',
    `Received: ${atEn} (Berlin time)`,
    end ? `Your subscription ends on ${endEn}. Premium stays active until then, and you will not be charged again.` : 'There was no active Premium subscription for this email address. You will not be charged again.'
  ];
  const footer = ['Buckswood Studios · Ludwig Maximillian Kienle · Zur Börse 12 · 10247 Berlin · https://www.buckswood.art'];
  const text = [...de, '', '—', '', ...en, '', '—', ...footer].join('\n');
  const p = lines => lines.map(l => l ? `<p style="margin:0 0 10px">${escapeHtml(l)}</p>` : '').join('');
  const html = `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:560px">${p(de)}<hr style="border:0;border-top:1px solid #ddd;margin:20px 0">${p(en)}<hr style="border:0;border-top:1px solid #ddd;margin:20px 0"><p style="margin:0;color:#666;font-size:13px">${escapeHtml(footer[0])}</p></div>`;
  return {subject: 'Deine Kündigung von Buckswood Premium ist eingegangen', text, html};
}
