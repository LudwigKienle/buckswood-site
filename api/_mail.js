// Sends email through Resend (resend.com). Not a route ("_" prefix).
// Environment: RESEND_API_KEY (secret). Optional MAIL_FROM, default below; the sending
// domain must be verified in Resend (DNS records on buckswood.art).
const FROM = process.env.MAIL_FROM || 'Buckswood Studios <service@buckswood.art>';
export const OWNER = 'luikienle@gmail.com';

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail({to, subject, text, html, bcc}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json'},
    body: JSON.stringify({from: FROM, to: [to], bcc: bcc ? [bcc] : undefined, reply_to: OWNER, subject, text, html})
  });
  if (!res.ok) throw new Error('Resend ' + res.status + ': ' + (await res.text()).slice(0, 300));
  return res.json();
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
