# Final Deployment Steps for Railway

## 🎯 Complete Deployment Checklist

Follow these steps in order for a successful deployment.

---

## Phase 1: Local Preparation

### 1.1 Move Convex Folder (REQUIRED)

**Windows PowerShell:**
```powershell
Move-Item -Path "src\convex" -Destination "convex"
```

**Windows CMD:**
```cmd
move src\convex convex
```

**Mac/Linux:**
```bash
mv src/convex convex
```

### 1.2 Verify Project Structure

Your project should now look like:
```
spijker-image/
├── convex/                    # ← At root, not in src/
│   ├── _generated/
│   ├── auth/
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── http.ts
│   ├── schema.ts
│   ├── tsconfig.json
│   └── users.ts
├── src/
├── convex.json               # ← Points to "convex/"
├── railway.toml              # ← Railway config
├── nixpacks.toml             # ← Build config
└── package.json              # ← Has "start" script
```

### 1.3 Test Locally

```bash
# 1. Regenerate Convex types
npx convex dev

# 2. In another terminal, start dev server
pnpm run dev

# 3. Test all features:
#    - Authentication
#    - Image upload
#    - n8n workflow
#    - Google Drive integration
#    - Supabase data storage
```

### 1.4 Build Test

```bash
# Test production build
pnpm run build

# Test production preview
pnpm run start
```

If both work without errors, proceed to Phase 2.

---

## Phase 2: Convex Production Deployment

### 2.1 Deploy Convex Backend

```bash
npx convex deploy --prod
```

### 2.2 Copy Production URL

After deployment, you'll see:
```
✔ Deployment complete!
  URL: https://your-project-name.convex.cloud
```

**Copy this URL** - you'll need it for Railway.

### 2.3 Verify Convex Deployment

```bash
# Check Convex logs
npx convex logs

# Or visit Convex dashboard
# https://dashboard.convex.dev
```

---

## Phase 3: Railway Deployment

### 3.1 Prepare Environment Variables

Create a text file with these variables (fill in your values):

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_SUPABASE_URL=https://xozstuskilqluzkkqjep.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_DRIVE_API_KEY=your-google-drive-api-key
```

### 3.2 Option A: Deploy from GitHub (Recommended)

1. **Commit and push your code:**
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. **Go to Railway:**
   - Visit https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect configuration

3. **Add Environment Variables:**
   - Click on your service
   - Go to "Variables" tab
   - Add all variables from Step 3.1
   - Click "Add" for each variable

4. **Deploy:**
   - Railway will automatically deploy
   - Monitor build logs in "Deployments" tab

### 3.2 Option B: Deploy from CLI

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
railway init
```

4. **Add Environment Variables:**
```bash
railway variables set VITE_CONVEX_URL=https://your-project.convex.cloud
railway variables set VITE_SUPABASE_URL=https://xozstuskilqluzkkqjep.supabase.co
railway variables set VITE_SUPABASE_ANON_KEY=your-key
railway variables set VITE_GOOGLE_DRIVE_API_KEY=your-key
```

5. **Deploy:**
```bash
railway up
```

---

## Phase 4: Post-Deployment Verification

### 4.1 Get Your Railway URL

In Railway dashboard:
- Click "Settings"
- Click "Generate Domain"
- Copy the URL (e.g., `your-app.up.railway.app`)

### 4.2 Test Your Deployment

Visit your Railway URL and test:

- [ ] App loads without errors
- [ ] Can see the dashboard
- [ ] Authentication works (if applicable)
- [ ] Can upload an image
- [ ] n8n workflow triggers
- [ ] Images save to Google Drive
- [ ] Session data saves to Supabase
- [ ] Can view history
- [ ] All features work

### 4.3 Check Logs

**Railway Logs:**
- Go to "Deployments" tab
- Click on latest deployment
- View logs for any errors

**Convex Logs:**
```bash
npx convex logs
```

**Browser Console:**
- Open DevTools (F12)
- Check Console tab for errors

---

## Phase 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

In Railway dashboard:
1. Go to "Settings"
2. Scroll to "Domains"
3. Click "Add Domain"
4. Enter your domain
5. Add DNS records as shown

### 5.2 Update DNS

Add these records to your domain:
- Type: CNAME
- Name: @ (or subdomain)
- Value: (provided by Railway)

---

## 🔧 Troubleshooting

### Build Fails

**Check:**
1. Railway build logs
2. Run `pnpm run build` locally
3. Verify all dependencies in package.json
4. Check TypeScript errors

**Common fixes:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### App Doesn't Start

**Check:**
1. Railway deployment logs
2. Environment variables are set
3. PORT variable (Railway sets automatically)

**Common fixes:**
- Verify `start` script in package.json
- Check vite.config.ts has port configuration
- Ensure railway.toml is correct

### Convex Connection Fails

**Check:**
1. VITE_CONVEX_URL is correct
2. Convex backend is deployed
3. Convex dashboard shows active deployment

**Fix:**
```bash
# Redeploy Convex
npx convex deploy --prod

# Update Railway variable
railway variables set VITE_CONVEX_URL=https://new-url.convex.cloud
```

### Supabase Connection Fails

**Check:**
1. VITE_SUPABASE_URL is correct
2. VITE_SUPABASE_ANON_KEY is correct
3. Supabase project is active
4. Database tables exist

**Fix:**
- Verify credentials in Supabase dashboard
- Check table structure
- Verify RLS policies

### Images Not Loading

**Check:**
1. Google Drive API key is correct
2. Drive folder permissions
3. n8n webhook is working

**Fix:**
- Test Drive API key
- Verify folder is public
- Check n8n workflow logs

---

## 📊 Monitoring

### Railway
- Dashboard: https://railway.app/dashboard
- View metrics, logs, and deployments

### Convex
- Dashboard: https://dashboard.convex.dev
- Monitor function calls and logs

### Supabase
- Dashboard: https://app.supabase.com
- Check database activity and logs

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Railway build completes without errors
✅ App loads at Railway URL
✅ No errors in browser console
✅ Can upload images
✅ n8n workflow executes
✅ Images appear in Google Drive
✅ Session data saves to Supabase
✅ History loads correctly
✅ All features work as expected

---

## 📝 Maintenance

### Updating Your App

**For GitHub deployments:**
```bash
git add .
git commit -m "Update feature"
git push
```
Railway auto-deploys on push.

**For CLI deployments:**
```bash
railway up
```

### Updating Environment Variables

```bash
railway variables set VARIABLE_NAME=new-value
```

Or update in Railway dashboard → Variables tab.

### Viewing Logs

```bash
# Railway logs
railway logs

# Convex logs
npx convex logs
```

---

## 🆘 Getting Help

- **Railway Docs:** https://docs.railway.app
- **Convex Docs:** https://docs.convex.dev
- **Supabase Docs:** https://supabase.com/docs
- **Railway Discord:** https://discord.gg/railway
- **Convex Discord:** https://discord.gg/convex

---

## ✨ You're Done!

Your app is now deployed and running on Railway! 🚀

Remember to:
- Monitor logs regularly
- Keep dependencies updated
- Back up your database
- Test before deploying changes
