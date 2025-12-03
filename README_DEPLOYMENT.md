# 🚀 Spijker Image Generation - Deployment Ready

Your project is now configured for Railway deployment!

## 📋 Quick Start

### 1️⃣ Move Convex Folder (Required First Step)

```bash
# Windows PowerShell
Move-Item -Path "src\convex" -Destination "convex"

# Windows CMD
move src\convex convex

# Mac/Linux
mv src/convex convex
```

### 2️⃣ Deploy Convex Backend

```bash
npx convex deploy --prod
```

Copy the production URL (e.g., `https://your-project.convex.cloud`)

### 3️⃣ Deploy to Railway

**Option A - GitHub (Recommended):**
1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Add environment variables
5. Deploy!

**Option B - CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 4️⃣ Set Environment Variables in Railway

```
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_SUPABASE_URL=https://xozstuskilqluzkkqjep.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_DRIVE_API_KEY=your-google-drive-api-key
```

---

## 📚 Documentation

- **[FINAL_DEPLOYMENT_STEPS.md](./FINAL_DEPLOYMENT_STEPS.md)** - Complete step-by-step guide
- **[CONVEX_MIGRATION_GUIDE.md](./CONVEX_MIGRATION_GUIDE.md)** - How to move convex folder
- **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)** - Detailed Railway guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Verification checklist

---

## ✅ What's Been Configured

### Files Updated:
- ✅ `package.json` - Added `start` script
- ✅ `vite.config.ts` - Added port/host configuration
- ✅ `convex.json` - Updated to point to root `convex/`
- ✅ `.gitignore` - Added dist, .env, .convex
- ✅ `.env.example` - Added all required variables

### Files Created:
- ✅ `railway.toml` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration
- ✅ Complete deployment documentation

---

## 🎯 Project Structure (After Moving Convex)

```
spijker-image/
├── convex/                    # ← Backend functions (moved from src/)
│   ├── _generated/
│   ├── auth/
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── http.ts
│   ├── schema.ts
│   └── users.ts
│
├── src/                       # ← Frontend code
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ResultsGallery.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── UploadPanel.tsx
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Landing.tsx
│   │   └── NotFound.tsx
│   └── main.tsx
│
├── public/
│   └── logo files
│
├── .env.example              # ← Template for environment variables
├── .gitignore                # ← Updated
├── convex.json               # ← Updated to "convex/"
├── package.json              # ← Has "start" script
├── railway.toml              # ← Railway config
├── nixpacks.toml             # ← Build config
└── vite.config.ts            # ← Port/host configured
```

---

## 🔑 Required Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_CONVEX_URL` | Convex backend URL | Run `npx convex deploy --prod` |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard → Settings → API |
| `VITE_GOOGLE_DRIVE_API_KEY` | Google Drive API key | Google Cloud Console → Credentials |

---

## 🧪 Testing Before Deployment

```bash
# 1. Move convex folder
move src\convex convex

# 2. Regenerate Convex types
npx convex dev

# 3. Test dev server (in another terminal)
pnpm run dev

# 4. Test production build
pnpm run build
pnpm run start

# 5. If all works, deploy!
```

---

## 🚨 Important Notes

### Before Deploying:
1. **MUST move convex folder** from `src/convex/` to `convex/`
2. **MUST deploy Convex backend** with `npx convex deploy --prod`
3. **MUST set all environment variables** in Railway dashboard
4. **MUST test locally** before deploying

### After Deploying:
- Railway automatically sets `PORT` variable
- Changes to env vars require redeployment
- GitHub pushes trigger auto-deployment
- Monitor logs in Railway dashboard

---

## 📊 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Backend:** Convex (auth & real-time)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Google Drive API
- **Workflow:** n8n automation
- **Hosting:** Railway

---

## 🎉 Deployment Success Checklist

After deployment, verify:

- [ ] App loads at Railway URL
- [ ] No console errors
- [ ] Authentication works
- [ ] Can upload images
- [ ] n8n workflow triggers
- [ ] Images save to Google Drive
- [ ] Data saves to Supabase
- [ ] History loads correctly
- [ ] All features functional

---

## 🆘 Need Help?

1. **Check the guides:**
   - Start with `FINAL_DEPLOYMENT_STEPS.md`
   - Follow `DEPLOYMENT_CHECKLIST.md`

2. **Common issues:**
   - Build fails → Check `pnpm run build` locally
   - Convex errors → Verify `VITE_CONVEX_URL`
   - Supabase errors → Check credentials
   - Port errors → Railway sets `PORT` automatically

3. **Resources:**
   - Railway Docs: https://docs.railway.app
   - Convex Docs: https://docs.convex.dev
   - Supabase Docs: https://supabase.com/docs

---

## 🎯 Next Steps

1. **Read:** `FINAL_DEPLOYMENT_STEPS.md`
2. **Move:** Convex folder to root
3. **Deploy:** Convex backend
4. **Deploy:** To Railway
5. **Test:** All features
6. **Celebrate:** 🎉

---

**Ready to deploy? Start with [FINAL_DEPLOYMENT_STEPS.md](./FINAL_DEPLOYMENT_STEPS.md)!**
