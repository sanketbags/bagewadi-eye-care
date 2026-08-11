# Dr Bagewadi's Eye Care Centre — Website

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser. Changes to files auto-refresh.

## Project structure

- `app/page.js` — the home page, assembles all sections
- `app/layout.js` — page-wide setup (fonts, metadata)
- `app/globals.css` — all styling and color/font variables
- `app/staff/page.js` — placeholder for the Phase 2 staff login
- `components/` — one file per section (Header, Hero, About, Services, Contact, Footer)

To edit content: open `components/About.js` or `components/Services.js` and
edit the `doctors` / `services` arrays at the top of each file — no need to
touch the layout code.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

(If you created the repo from github.com first, it already gave you the exact
`git remote add origin ...` command — use that instead.)

## Deploy on Vercel

1. Go to vercel.com, sign in with GitHub
2. Click "Add New" → "Project", select this repo
3. Leave all settings as default (Vercel auto-detects Next.js) → Deploy
4. You'll get a live URL like `bagewadi-eye-care.vercel.app` within a minute
5. Every future `git push` to `main` auto-deploys the update
