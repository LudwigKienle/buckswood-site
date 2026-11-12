# Buckswood Studios – buckswood.art

Static site on Vercel (`vercel.json`: no build, clean URLs). Pushing to `main` deploys live.

| URL | File | What |
|---|---|---|
| `/` | `index.html` | Microdrama platform home: featured banner, trending, new episodes, all series, plans |
| `/watch` | `watch.html` | Vertical player, deep links like `/watch#the-new-cleaner-2` |
| `/about` | `about.html` | Studio, results and the case, partner contact |
| `/series/<id>` | `series/*.html` | One indexable page per series (generated) |
| `/impressum`, `/datenschutz` | `impressum.html`, `datenschutz.html` | Legal pages |
| `/editor` | `editor.html` | Old landing page of the AI Video Production Editor (moves elsewhere) |
| `/microdramas` | redirect | → `/` |

Series and episodes live in one place: `assets/catalog.js`. Shared look: `assets/platform.css`.
After changing the catalog run `node scripts/build-seo.mjs`: it rebuilds `series/*.html` and `sitemap.xml`.
Fonts are self-hosted in `assets/fonts/` (no Google Fonts requests).

**Deploy:** pushing to `main` does not deploy on its own; trigger a production deployment in Vercel (or via the Vercel MCP `create_deployment`, target production).
Local preview: any static server that maps `/watch` to `watch.html` (e.g. `npx serve`).

## Microdramas

- Episodes: `media/episodes/` (720p MP4). To add one: encode it to 720×1280 H.264 with faststart, add a poster still to `assets/microdramas/`, add an entry in `assets/catalog.js`.
- Free viewers get a pre-roll ad through the Google IMA SDK; Premium viewers get none. Settings sit at the top of the script in `watch.html`:
  - `AD_TAG`: currently Google's public **sample** tag. Replace it with the VAST tag of your own Google Ad Manager ad unit before launch.
  - `STRIPE_LINK`: Stripe Payment Link for Premium. Empty = "Notify me" mail link.
  - `AD_EVERY`: one ad before every Nth episode.
- Premium is a **prototype**: the flag lives in the viewer's browser (`localStorage`), and the dialog has a "Preview" switch. Before charging money, Premium has to come from a server (login + Stripe webhook).
- Consent: `assets/consent.js` + `consent.css` show a banner on every platform page; the IMA SDK loads only after "Accept all". Footer link "Cookie settings" reopens it.

### Connecting Google Ad Manager
1. Create an AdSense account (adsense.google.com) for www.buckswood.art and wait for approval.
2. Open Google Ad Manager (admanager.google.com) with the same Google account and link AdSense.
3. Inventory → Ad units → new unit "buckswood-preroll", type video. Copy its VAST tag into `AD_TAG` in `watch.html`.
4. Add `ads.txt` at the site root with the line Google shows you (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`).
5. Privacy & messaging → create a European regulations (GDPR) message. Google's certified consent message then replaces `assets/consent.js`; keep the rule that the IMA SDK loads only after consent.
