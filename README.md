# Startup Job Radar — ₹1Cr Career Engine

AI-powered startup job research dashboard for **PM / Growth / Sales / Strategy** roles at Indian startups. Based on the Think School × Ankit Agarwal playbook.

Every time you hit **Research now**, the AI analyst scans its knowledge of 50+ funded Indian startups and surfaces fresh job openings with ESOP flags, salary ranges, stage badges, and cold DM targets.

---

## Deploy to Vercel in 5 minutes

### Step 1 — Get your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "init: startup job radar"
gh repo create startup-jobs-radar --public --push
# OR manually create a repo on github.com and push
```

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo `startup-jobs-radar`
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** → Add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key from Step 1)
5. Click **Deploy**

Done. Your live URL will be `https://startup-jobs-radar.vercel.app`

---

## Run locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
npm run dev
# Open http://localhost:3000
```

---

## How it works

```
Browser → POST /api/research
         └→ Secure server-side route (your API key never exposed)
              └→ Anthropic Claude API
                   └→ Returns 14-18 real startup jobs as JSON
                        └→ Rendered with role/stage filters
```

The API key lives in Vercel's environment variables — never in the browser. This is why the Claude.ai widget version failed (CORS + no server-side key). This version is production-safe.

---

## Filters available
- **Role**: PM / Growth / Sales / Strategy
- **Stage**: All / Seed / Series A-B / Series C+ Unicorn
- **Per card**: ESOP badge · Salary range · Hot/New signals · Direct apply link · Cold DM target on LinkedIn

---

## Stack
- Next.js 14 (Pages Router)
- TypeScript
- Anthropic Claude Sonnet (server-side API route)
- Google Fonts: Syne + DM Mono
- Zero external UI libraries — pure CSS
