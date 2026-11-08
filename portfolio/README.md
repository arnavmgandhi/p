# Arnav — Personal Portfolio

Frontend developer and first-year CSE (Polytechnic diploma) student at MIT-WPU, Pune.

## Design

Editorial and quiet: warm paper and ink, one restrained accent, a serif display face paired with a clean sans and mono labels. Hairline rules instead of cards, an index-style project list, local Pune time, and a light/dark toggle that follows the system by default. No glass, glow, gradients or particle background.

- **Fonts**: Instrument Serif, Geist, Geist Mono (Google Fonts)
- **Stack**: vanilla HTML, CSS and JS. No frameworks, no CDN scripts, no build step.
- **Motion**: headline word reveal and one-time scroll fades via IntersectionObserver. All disabled under `prefers-reduced-motion`.
- **PWA**: manifest, service worker (network-first HTML, cache-first assets), offline page.

## Things to update later

- Project screenshots: add files to `assets/projects/` and set `image` in `js/projects-data.js`
- Domain in `index.html`, `sitemap.xml`, `robots.txt` if you change from `arnav-portfolio.netlify.app`

## Structure

```text
index.html  404.html  offline.html  manifest.json  sw.js  netlify.toml
css/   tokens.css  base.css  components.css  sections.css
js/    main.js  animations.js  projects-data.js
assets/icons/   favicon + PWA icons
```

---

## Local Run Instructions

No build process or `npm install` is required:

### Option 1: VS Code Live Server Extension (Recommended)
1. Open this repository in **VS Code**.
2. Install the **Live Server** extension (`ritwickdey.LiveServer`) if not already installed.
3. Right-click `index.html` and click **"Open with Live Server"**, or click **"Go Live"** in the bottom status bar.
4. The site will open at `http://127.0.0.1:5500`.

### Option 2: Python HTTP Server
```bash
# Python 3
python -m http.server 8000
```
Navigate to `http://localhost:8000`.

### Option 3: Node.js (npx)
```bash
npx serve .
```

---

## Netlify Deployment Guide

Follow these steps to deploy this repository directly to Netlify with continuous deployment:

### Step 1: Push Code to a GitHub Repository
1. Initialize git locally (if not already initialized) and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete personal portfolio website"
   ```
2. Create a new empty repository on [GitHub](https://github.com/new) (e.g., `arnav-portfolio`).
3. Link your remote repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/arnav-portfolio.git
   git push -u origin main
   ```

### Step 2: Connect the Repository in Netlify
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select **GitHub** as your Git provider and authorize Netlify.
4. Choose your `arnav-portfolio` repository.

### Step 3: Configure Build & Deploy Settings
Netlify will automatically detect configuration from `netlify.toml`:
- **Base directory**: *(Leave empty)*
- **Build command**: *(Leave empty — zero build step)*
- **Publish directory**: `.`
Click **"Deploy site"**. Your site will deploy in seconds at a `https://<site-name>.netlify.app` URL.

### Step 4: Automatic HTTPS Verification
- Netlify automatically provisions a free **Let's Encrypt SSL/TLS Certificate**.
- In the Netlify dashboard under **Site settings &rarr; Domain management &rarr; HTTPS**, ensure "Automatic TLS Certificates" shows **Active**.

### Step 5: Connecting a Custom Domain (e.g., `arnav.dev`)
1. In Netlify, go to **Site configuration &rarr; Domain management &rarr; Custom domains**.
2. Click **"Add a domain"** and enter your domain name (e.g., `arnav.dev`).
3. In your domain registrar's DNS panel (Namecheap, GoDaddy, Cloudflare, etc.), configure DNS records:
   - **Apex / Root Domain (`@`)**: Add an `A` record pointing to Netlify's load balancer IP `75.2.60.5` (or an `ALIAS`/`ANAME` record pointing to `<site-name>.netlify.app`).
   - **Subdomain (`www`)**: Add a `CNAME` record pointing to `<site-name>.netlify.app`.
4. Wait a few minutes for DNS propagation. Netlify will issue an SSL certificate covering both root and `www` subdomains automatically.
