# Family Command Center — Deploy

## What's in this folder
- `index.html` — the landing page + live demo. Static, no build step.
- `api/organize.js` — serverless function. Holds the Claude API call server-side so the API key never reaches the browser.
- `package.json` — lets Vercel recognize this as a Node project.

## Deploy to Vercel (free)
1. Create a GitHub repo and push these files to it (or drag-and-drop upload via github.com if you're not using git commands yet).
2. Go to vercel.com and sign in with your GitHub account.
3. Click **New Project** and import this repo.
4. Before deploying, open **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key (paste it directly here — never in code or chat)
5. Click **Deploy**.
6. Vercel gives you a live URL like `family-command-center.vercel.app` — that's your shareable link.

## Known gap (next step)
The email signup box on the page is a placeholder — it validates the email format but doesn't save it anywhere yet. Wiring that up (e.g. with Formspree, a free no-backend form service) is the next thing to do before relying on it for real signups.
