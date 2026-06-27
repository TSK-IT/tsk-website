# TSK — The Stellar Kraft · Launch Guide

An ultra-luxury, multi-page website for **The Stellar Kraft** (TSK) — Signature Lighting,
Architectural Ceilings and Sculptural Systems. Built as a fast **static site** (HTML / CSS /
vanilla JS) so it deploys anywhere, loads fast, and needs no servers or databases.

- **~395 products** across 3 divisions, generated from your three catalogues
- Cinematic self-made videos (hero + division reels + atelier + installation)
- Data-driven catalogue: edit `data/catalog.json`, regenerate `data/catalog.js`
- SEO-ready: meta + Open Graph + Twitter + JSON-LD + `sitemap.xml` + `robots.txt`

---

## 1 · Where will I receive form submissions?

Submissions go to **management@thestellarkraft.com**. Two modes (already wired):

1. **Out of the box (no setup):** when a visitor submits, their email app opens a
   pre-filled message addressed to you. Works on any host.
2. **Silent email delivery (recommended):** get a **free** access key from
   <https://web3forms.com> (register with `management@thestellarkraft.com`), then open
   **`js/tsk.js`**, find `window.TSK.FORM_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'` and paste your
   key. Now every form (Contact + every product page) is emailed to you automatically —
   no backend required. You can also see all submissions in the Web3Forms dashboard.

   *Alternative:* if you host on Netlify, you can instead use **Netlify Forms** (submissions
   appear in your Netlify dashboard + email). Ask and I'll switch the markup.

---

## 2 · Hosting — the final solution (do NOT renew A2)

Your site is static, so a shared cPanel host like A2 is unnecessary, slower and more
expensive. Use a **free, global, auto-HTTPS static host**. Recommended: **Netlify**
(easiest). Cloudflare Pages or Vercel work identically.

### A. Put the site online (Netlify, ~3 minutes)
1. Go to <https://app.netlify.com> → sign up (free).
2. Click **“Add new site” → “Deploy manually.”**
3. Drag the **entire `tsk_site` folder** onto the upload area.
4. It goes live instantly at a temporary URL like `random-name.netlify.app`. Test it.

### B. Connect your GoDaddy domain `thestellarkraft.com`
1. In Netlify: **Site → Domain management → Add a domain** → enter
   `thestellarkraft.com`. Netlify shows the DNS records to set.
2. Log in to **GoDaddy → My Products → DNS** for `thestellarkraft.com`:
   - **CNAME** — Host `www` → Value `YOUR-SITE.netlify.app` (from Netlify)
   - **A record** — Host `@` → Value `75.2.60.5` (Netlify's apex IP), *or* follow
     Netlify's “apex / forwarding” instructions exactly as shown.
3. Back in Netlify, set **`www.thestellarkraft.com` as primary** and enable
   **“Force HTTPS”** (free SSL is issued automatically in a few minutes).
4. Done — `https://www.thestellarkraft.com` is live. DNS can take 5 min–1 hr to propagate.

> The included `netlify.toml`, `_headers` and `robots.txt` set caching, security headers
> and the apex→www redirect automatically.

### C. Cloudflare Pages alternative (also free)
Upload the folder at <https://pages.cloudflare.com>, then add the domain. If your domain's
nameservers are on Cloudflare, DNS + SSL are automatic.

**Please don't email or paste your A2 / GoDaddy passwords to anyone (including in chat).**
You only ever need to log in to GoDaddy's DNS panel yourself, following the steps above.

---

## 3 · Submit your site to Google (SEO)
1. <https://search.google.com/search-console> → add `https://www.thestellarkraft.com`.
2. Verify (Netlify supports the DNS/HTML method).
3. Submit `https://www.thestellarkraft.com/sitemap.xml`.

---

## 4 · Editing content
- **Products / collections / projects:** edit `data/catalog.json`, then regenerate the
  embedded copy: in this folder run
  `python3 -c "import json;c=json.load(open('data/catalog.json'));open('data/catalog.js','w').write('window.TSK_CATALOG='+json.dumps(c,ensure_ascii=False,separators=(',',':'))+';')"`
- **Founder photo:** drop a real photo at **`assets/founder.jpg`** (portrait, ~1000×1250).
  The Atelier page uses it automatically.
- **Replace the hero video:** swap `assets/video/hero.mp4` (full quality) and
  `assets/video/hero_web.mp4` (the lighter one the homepage plays).
- **Brand contacts / LinkedIn:** in `data/catalog.json` under `brand`.

## 5 · Local preview
From this folder: `python3 -m http.server 8000` → open <http://localhost:8000>.

---
© The Stellar Kraft · Founder Kumar Vishal · Bengaluru, India
