# 🚀 Quick Deployment Guide

## Step 1: Deploy Backend to Render (5 minutes)

1. Go to https://render.com and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your repository: `Anshulmehra001/Spooky-Study-Buddy`
4. Configure:
   - **Name**: `spooky-study-buddy-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. Copy your backend URL (e.g., `https://spooky-study-buddy-api.onrender.com`)

## Step 2: Enable GitHub Pages (2 minutes)

1. Go to your repo: https://github.com/Anshulmehra001/Spooky-Study-Buddy
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. That's it! GitHub Actions will auto-deploy

## Step 3: Update Backend URL (1 minute)

Update the GitHub Actions workflow with your Render backend URL:

1. Edit `.github/workflows/deploy.yml`
2. Change line 38:
   ```yaml
   VITE_API_URL: https://your-actual-render-url.onrender.com
   ```
3. Commit and push

## Step 4: Wait for Deployment (2-3 minutes)

1. Go to **Actions** tab in your GitHub repo
2. Watch the deployment progress
3. Once complete, your app will be live at:
   `https://anshulmehra001.github.io/Spooky-Study-Buddy/`

## 🎉 Done!

Your app is now live and auto-deploys on every push to main!

**Frontend**: https://anshulmehra001.github.io/Spooky-Study-Buddy/
**Backend**: https://your-render-url.onrender.com

---

## Alternative: Vercel (Even Easier)

If you prefer Vercel for frontend:

```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

Then update the API URL in `client/.env.production` with your Render backend URL.
