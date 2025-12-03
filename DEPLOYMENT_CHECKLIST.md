# Railway Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Build Configuration
- [x] Added `start` script to package.json
- [x] Updated vite.config.ts with port and host configuration
- [x] Created railway.toml configuration
- [x] Created nixpacks.toml configuration
- [x] Updated .gitignore with dist, .env, .convex

### 2. Convex Backend
- [ ] Deploy Convex to production: `npx convex deploy --prod`
- [ ] Copy production Convex URL
- [ ] Verify Convex functions are working

### 3. Environment Variables Ready
- [ ] VITE_CONVEX_URL (from Convex deployment)
- [ ] VITE_SUPABASE_URL (from Supabase dashboard)
- [ ] VITE_SUPABASE_ANON_KEY (from Supabase dashboard)
- [ ] VITE_GOOGLE_DRIVE_API_KEY (from Google Cloud Console)

### 4. Database Setup
- [ ] Supabase tables created
- [ ] `image_generations` table exists
- [ ] `session_name` column added to table
- [ ] Row Level Security (RLS) policies configured

## 🚀 Deployment Steps

### Railway Setup
- [ ] Create Railway account
- [ ] Connect GitHub repository (or use CLI)
- [ ] Create new project in Railway
- [ ] Select repository

### Configure Railway
- [ ] Add all environment variables in Railway dashboard
- [ ] Verify PORT is set (Railway does this automatically)
- [ ] Generate Railway domain or add custom domain

### Deploy
- [ ] Push code to GitHub (if using GitHub deployment)
- [ ] Or run `railway up` (if using CLI)
- [ ] Monitor build logs in Railway dashboard
- [ ] Wait for deployment to complete

## ✅ Post-Deployment Verification

### Test Application
- [ ] Visit Railway URL
- [ ] Test authentication (if applicable)
- [ ] Upload test image
- [ ] Verify n8n webhook connection
- [ ] Check Google Drive integration
- [ ] Test image generation workflow
- [ ] Verify Supabase data storage
- [ ] Test session history loading

### Monitor
- [ ] Check Railway deployment logs
- [ ] Monitor Convex dashboard for function calls
- [ ] Check Supabase dashboard for database activity
- [ ] Verify no errors in browser console

## 🔧 Troubleshooting

### If build fails:
1. Check Railway build logs
2. Run `pnpm run build` locally to test
3. Verify all dependencies in package.json
4. Check TypeScript errors

### If app doesn't start:
1. Check Railway deployment logs
2. Verify environment variables are set
3. Ensure PORT variable is available
4. Check start command in railway.toml

### If Convex connection fails:
1. Verify VITE_CONVEX_URL is correct
2. Redeploy Convex: `npx convex deploy --prod`
3. Check Convex dashboard for errors

### If Supabase connection fails:
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
2. Check Supabase project is active
3. Verify database tables exist
4. Check RLS policies

## 📝 Notes

- Railway automatically sets the PORT environment variable
- All VITE_* variables must be set in Railway dashboard
- Convex backend must be deployed separately
- Changes to environment variables require redeployment
- GitHub pushes trigger automatic redeployment

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Convex Dashboard: https://dashboard.convex.dev
- Supabase Dashboard: https://app.supabase.com
- Google Cloud Console: https://console.cloud.google.com

## ✨ Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Can upload images
- ✅ n8n workflow triggers
- ✅ Images save to Google Drive
- ✅ Session data saves to Supabase
- ✅ History loads correctly
- ✅ All features work as in development
