# Buckswood – Landing Page

Static page (one `index.html` and `assets/`) for Buckswood – AI Video Production Editor.
The download buttons point to GitHub Releases (`/releases/latest/download/...`), so every new release appears automatically.
The version and file sizes are loaded live from the GitHub API, with v3.1.0 as the fallback.

Local preview: `python3 -m http.server 8765` → http://localhost:8765

Hosting: any static host works (Vercel, GitHub Pages, Netlify). Once the domain is set, add a `CNAME` file containing the domain for GitHub Pages, or add the domain in the Vercel project settings.
