# Buckswood Studios – buckswood.art

Static site on Vercel (`vercel.json`: no build, clean URLs). Pushing to `main` deploys live.

| URL | File | What |
|---|---|---|
| `/` | `index.html` | Microdrama platform home: featured banner, trending, new episodes, all series, plans |
| `/watch` | `watch.html` | Vertical player, deep links like `/watch#the-new-cleaner-2` |
| `/about` | `about.html` | Studio, results and the case, partner contact |
| `/editor` | `editor.html` | Old landing page of the AI Video Production Editor (moves elsewhere) |
| `/microdramas` | redirect | → `/` |

Series and episodes live in one place: `assets/catalog.js`. Shared look: `assets/platform.css`.
Local preview: any static server that maps `/watch` to `watch.html` (e.g. `npx serve`).

## Microdramas

- Episodes: `media/episodes/` (720p MP4). To add one: encode it to 720×1280 H.264 with faststart, add a poster still to `assets/microdramas/`, add an entry in `assets/catalog.js`.
- Free viewers get a pre-roll ad through the Google IMA SDK; Premium viewers get none. Settings sit at the top of the script in `watch.html`:
  - `AD_TAG`: currently Google's public **sample** tag. Replace it with the VAST tag of your own Google Ad Manager ad unit before launch.
  - `STRIPE_LINK`: Stripe Payment Link for Premium. Empty = "Notify me" mail link.
  - `AD_EVERY`: one ad before every Nth episode.
- Premium is a **prototype**: the flag lives in the viewer's browser (`localStorage`), and the dialog has a "Preview" switch. Before charging money, Premium has to come from a server (login + Stripe webhook).
- Before ads go live in the EU: consent banner (Google-certified CMP, TCF 2.2), privacy policy and Impressum.
