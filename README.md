# Buckswood – Landing Page

Static page (one `index.html` and `assets/`) for Buckswood – AI Video Production Editor.
The download buttons point to GitHub Releases (`/releases/latest/download/...`), so every new release appears automatically.
The version and file sizes are loaded live from the GitHub API, with v3.1.0 as the fallback.

Local preview: `python3 -m http.server 8765` → http://localhost:8765

Hosting: any static host works (Vercel, GitHub Pages, Netlify). Once the domain is set, add a `CNAME` file containing the domain for GitHub Pages, or add the domain in the Vercel project settings.

## Microdramas

- `microdramas.html` → buckswood.art/microdramas: series, results, plans (Free with ads / Premium without ads), the case, contact.
- `watch.html` → buckswood.art/watch: vertical player for the episodes in `media/episodes/` (720p MP4, deep links like `/watch#the-new-cleaner-2`).
- Free viewers get a pre-roll ad through the Google IMA SDK; Premium viewers get none. Settings sit at the top of the script in `watch.html`:
  - `AD_TAG`: currently Google's public **sample** tag. Replace it with the VAST tag of your own Google Ad Manager ad unit before launch.
  - `STRIPE_LINK`: Stripe Payment Link for Premium. Empty = "Notify me" mail link.
  - `AD_EVERY`: one ad before every Nth episode.
- Premium is a **prototype**: the flag lives in the viewer's browser (`localStorage`), and the dialog has a "Preview" switch. Before charging money, Premium has to come from a server (login + Stripe webhook).
- Before ads go live in the EU: consent banner (Google-certified CMP, TCF 2.2), privacy policy and Impressum.
