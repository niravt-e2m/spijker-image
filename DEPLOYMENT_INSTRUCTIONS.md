# 🚀 Railway Deployment Instructions

## Step 1: Deploy Convex Backend

1. Open your terminal in the project folder
2. Run this command:
   ```bash
   npx convex deploy --prod
   ```
3. After deployment completes, **COPY the Convex URL** (looks like: `https://your-project.convex.cloud`)
4. Save it - you'll need it in Step 3

---

## Step 2: Get Your API Keys

### A. Supabase Keys
1. Go to: https://app.supabase.com
2. Open your project
3. Click **Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### B. Google Drive API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the API key
4. Click **Edit API key** → **API restrictions**
5. Select **Restrict key** → Check **Google Drive API**
6. Click **Save**

---

## Step 3: Deploy to Railway

### A. Create Railway Account
1. Go to: https://railway.app
2. Sign up with GitHub (recommended)

### B. Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Connect your GitHub account if not connected
4. Select this repository
5. Click **Deploy Now**

### C. Add Environment Variables

1. In Railway dashboard, click on your deployed service
2. Go to **Variables** tab
3. Click **+ New Variable**
4. Add these variables **ONE BY ONE**:

```
Variable Name: VITE_CONVEX_URL
Value: [Paste your Convex URL from Step 1]

Variable Name: VITE_SUPABASE_URL
Value: [Paste your Supabase Project URL from Step 2A]

Variable Name: VITE_SUPABASE_ANON_KEY
Value: [Paste your Supabase anon key from Step 2A]

Variable Name: VITE_GOOGLE_DRIVE_API_KEY
Value: [Paste your Google Drive API key from Step 2B]
```

5. After adding all variables, Railway will automatically redeploy

---

## Step 4: Get Your App URL

1. In Railway dashboard, go to **Settings** tab
2. Scroll to **Domains** section
3. Click **Generate Domain**
4. Copy your app URL (looks like: `https://your-app.up.railway.app`)
5. Open it in your browser - your app is live! 🎉

---

## 📋 Quick Reference - Where to Add Keys

| Key Name | Where to Get It | Where to Add It |
|----------|----------------|-----------------|
| `VITE_CONVEX_URL` | Run `npx convex deploy --prod` | Railway Variables tab |
| `VITE_SUPABASE_URL` | Supabase → Settings → API | Railway Variables tab |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API | Railway Variables tab |
| `VITE_GOOGLE_DRIVE_API_KEY` | Google Cloud Console → Credentials | Railway Variables tab |

---

## 🔧 Troubleshooting

### Build Failed?
- Check Railway **Deployments** tab for error logs
- Make sure all environment variables are added
- Try redeploying: Click **Deploy** button

### App Not Loading?
- Wait 2-3 minutes for deployment to complete
- Check if all 4 environment variables are set
- Look at Railway logs for errors

### Convex Connection Error?
- Verify `VITE_CONVEX_URL` is correct
- Make sure you ran `npx convex deploy --prod`
- Check Convex dashboard: https://dashboard.convex.dev

### Supabase Connection Error?
- Verify both Supabase variables are correct
- Check your Supabase project is active
- Make sure database tables exist

### Google Drive Not Working?
- Verify API key is correct
- Make sure Google Drive API is enabled
- Check API key restrictions allow your domain

---

## 🔄 Updating Your App

After making code changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. Railway will automatically detect the push and redeploy

---

## ✅ Success Checklist

Your deployment is successful when you can:
- [ ] Open your Railway URL
- [ ] See the login/landing page
- [ ] Upload an image
- [ ] Generate variations
- [ ] See images in gallery
- [ ] View history

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Convex Docs: https://docs.convex.dev
- Supabase Docs: https://supabase.com/docs

---

## 🎯 Summary

1. ✅ Deploy Convex → Get URL
2. ✅ Get Supabase keys from dashboard
3. ✅ Get Google Drive API key
4. ✅ Deploy to Railway
5. ✅ Add all 4 environment variables
6. ✅ Open your app URL

**That's it! Your app is live! 🚀**
