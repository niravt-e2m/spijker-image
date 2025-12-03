# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- Convex account (https://convex.dev)
- Supabase project
- Google Drive API key

## Step 1: Deploy Convex Backend

1. Install Convex CLI globally:
```bash
npm install -g convex
```

2. Deploy Convex to production:
```bash
npx convex deploy --prod
```

3. Copy the production Convex URL (it will look like: `https://your-project.convex.cloud`)

## Step 2: Prepare Environment Variables

You'll need these environment variables in Railway:

### Required Variables:
- `VITE_CONVEX_URL` - Your Convex production URL from Step 1
- `VITE_SUPABASE_URL` - Your Supabase project URL (from Supabase dashboard)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key (from Supabase dashboard)
- `VITE_GOOGLE_DRIVE_API_KEY` - Your Google Drive API key
- `PORT` - Railway will set this automatically

### Optional Variables:
- Any other `VITE_*` prefixed variables your app uses

## Step 3: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. Go to Railway dashboard (https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository
6. Railway will auto-detect the configuration from `railway.toml`

### Option B: Deploy from CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Deploy:
```bash
railway up
```

## Step 4: Configure Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add all the environment variables listed in Step 2
5. Click "Deploy" to restart with new variables

## Step 5: Configure Custom Domain (Optional)

1. In Railway dashboard, go to "Settings"
2. Click "Generate Domain" for a free Railway domain
3. Or add your custom domain

## Important Notes

### Convex Functions Location
⚠️ **Important**: Your Convex functions are currently in `src/convex/`. For production, they should be at the project root in `convex/`.

If you need to move them:
1. Move `src/convex/` to `convex/` at project root
2. Update imports in your code from:
   ```typescript
   import { api } from './convex/_generated/api'
   ```
   to:
   ```typescript
   import { api } from '../convex/_generated/api'
   ```
3. Update `convex.json` if needed

### Build Process
- Railway uses Nixpacks to build your app
- Build command: `pnpm install && pnpm run build`
- Start command: `pnpm run start`
- The app runs on the port specified by Railway's `$PORT` environment variable

### Troubleshooting

**Build fails:**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `pnpm run build`

**App doesn't start:**
- Check Railway deployment logs
- Verify environment variables are set correctly
- Ensure `PORT` variable is available

**Convex connection fails:**
- Verify `VITE_CONVEX_URL` is set correctly
- Ensure Convex backend is deployed: `npx convex deploy --prod`
- Check Convex dashboard for deployment status

**Supabase connection fails:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify database tables exist

## Monitoring

- View logs in Railway dashboard under "Deployments" tab
- Monitor Convex functions in Convex dashboard
- Check Supabase usage in Supabase dashboard

## Updating Your Deployment

### For GitHub deployments:
```bash
git add .
git commit -m "Update"
git push
```
Railway will automatically redeploy.

### For CLI deployments:
```bash
railway up
```

## Support

- Railway Docs: https://docs.railway.app
- Convex Docs: https://docs.convex.dev
- Supabase Docs: https://supabase.com/docs
