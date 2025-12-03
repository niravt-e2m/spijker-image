# ⚡ Quick Deploy Guide

## 🚀 Deploy in 5 Steps

### Step 1: Move Convex Folder
```bash
move src\convex convex
```

### Step 2: Deploy Convex
```bash
npx convex deploy --prod
```
📝 Copy the URL: `https://your-project.convex.cloud`

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### Step 4: Deploy on Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add these variables:
   ```
   VITE_CONVEX_URL=https://your-project.convex.cloud
   VITE_SUPABASE_URL=https://xozstuskilqluzkkqjep.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key
   VITE_GOOGLE_DRIVE_API_KEY=your-key
   ```

### Step 5: Test
Visit your Railway URL and test all features!

---

## 🔧 If Something Breaks

### Build Fails
```bash
pnpm run build
```
Fix any errors, then redeploy.

### Convex Not Working
```bash
npx convex deploy --prod
```
Update `VITE_CONVEX_URL` in Railway.

### Need Logs
- Railway: Dashboard → Deployments → View Logs
- Convex: `npx convex logs`

---

## 📚 Full Documentation
See `FINAL_DEPLOYMENT_STEPS.md` for complete guide.

---

**That's it! You're deployed! 🎉**
