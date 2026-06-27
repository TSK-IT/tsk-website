# TSK — The Stellar Kraft · Launch & Hosting Guide

This website is a **static site** (HTML/CSS/JS + images + video). There is **no build step** and **no server software** to maintain — which makes it fast, secure, cheap to host, and very hard to break. You do **not** need A2 Hosting (or any cPanel/PHP host) anymore.

---

## 1. The fastest way to go live (recommended: Netlify — free)

**A. Put the site on Netlify**
1. Go to **https://app.netlify.com** and sign up (free) with your email.
2. Click **“Add new site” → “Deploy manually”**.
3. Drag the **entire `TSK Website` folder** onto the upload area.
4. In ~30 seconds you get a live URL like `https://tsk-stellar.netlify.app`. Your site is live.

**B. Connect your GoDaddy domain `thestellarkraft.com`**
1. In Netlify: **Site settings → Domain management → Add a domain →** type `thestellarkraft.com`.
2. Netlify shows you DNS records. Choose the **easiest** option below.

   **Option 1 — Point records at Netlify (keep DNS at GoDaddy):**
   - Log in to **GoDaddy → My Products → DNS** for `thestellarkraft.com`.
   - Add/edit these records (Netlify shows your exact values; typical values):
     - **A record** — Host `@` → Value `75.2.60.5`
     - **CNAME** — Host `www` → Value `your-site-name.netlify.app`
   - Save. Propagation takes 15 min – 2 hrs.

   **Option 2 — Let Netlify run DNS (most reliable, auto‑SSL):**
   - In Netlify, choose **“Use Netlify DNS”**; it gives you **4 nameservers** (e.g. `dns1.p01.nsone.net …`).
   - In **GoDaddy → DNS → Nameservers → Change → “I’ll use my own nameservers”**, paste those 4. Save.

3. Netlify auto-issues a free **HTTPS certificate**. Enable **“Force HTTPS”**.

Done — `https://www.thestellarkraft.com` is live with SSL.

### Alternatives (all free, all work the same way)
- **Cloudflare Pages** — `pages.cloudflare.com` → upload folder → add domain (great if your DNS is already on Cloudflare). `_headers` / `_redirects` files are already included.
- **Vercel** — `vercel.com` → drag the folder → add domain.
- **GoDaddy itself** — if you prefer to stay with GoDaddy, their *Website hosting* can serve these static files too, but Netlify/Cloudflare are faster and free.

> Re: your old **A2 Hosting** — no action needed. It was a PHP/cPanel plan that was removed for non‑payment. This new site doesn’t require it. Please **don’t share passwords in chat**; you won’t need to.

---

## 2. Where do form submissions go? (Important)

The Contact and product enquiry forms collect: name, company, country, role, project type, budget, timeline, phone, email, description.

**Out of the box (today, zero setup):** submitting opens the visitor’s email app with all details pre‑filled, addressed to **management@thestellarkraft.com**. It always does *something*.

**To receive submissions silently in your inbox (recommended) — 2 minutes:**
1. Go to **https://web3forms.com**, enter **management@thestellarkraft.com**, and copy the free **Access Key**.
2. Open **`js/tsk.js`**, find this line near the top:
   ```js
   window.TSK.FORM_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
   ```
   Replace `YOUR_WEB3FORMS_ACCESS_KEY` with your key. Save & re‑upload.
3. Every submission now arrives at **management@thestellarkraft.com** automatically (no backend needed). You can also add support@ as a second recipient in the Web3Forms dashboard.

**If you host on Netlify** you can instead use **Netlify Forms** (submissions appear in the Netlify dashboard + email notifications). Ask your developer to add `data-netlify="true"` to the `<form>` tags and remove the JS handler — but Web3Forms above is simpler and works on any host.

---

## 3. Editing the site later

- **Products / collections / projects** live in **`data/catalog.json`**. After editing it, regenerate the embedded copy the site reads:
  ```bash
  python3 -c "import json;c=json.load(open('data/catalog.json'));open('data/catalog.js','w').write('window.TSK_CATALOG='+json.dumps(c,ensure_ascii=False,separators=(',',':'))+';')"
  ```
- **Founder photo:** drop a real photo at **`assets/founder.jpg`** (portrait) — it auto‑replaces the stand‑in on the Atelier page.
- **Hero video:** replace **`assets/video/hero_web.mp4`** (keep the same name) and **`assets/video/hero.jpg`** (poster).
- **Brand details / social links / phone / email:** in `data/catalog.json` under `"brand"`, then regenerate as above.
- **Downloadable catalogue:** replace **`assets/TSK-Signature-Catalogue.pdf`**.

---

## 4. What’s included for SEO
- Unique title + meta description + canonical on every page
- Open Graph + Twitter cards + share image (`assets/og-image.jpg`)
- `robots.txt` and `sitemap.xml` (submit the sitemap in **Google Search Console**)
- Organization structured data (JSON‑LD) on the homepage
- Fast static delivery, lazy‑loaded images, long‑cache headers

**After launch:** add the site to **Google Search Console** and **Bing Webmaster Tools**, submit `https://www.thestellarkraft.com/sitemap.xml`, and create a Google Business Profile for local/India discovery.

---

*TSK Design Studio · · Bengaluru, India*
