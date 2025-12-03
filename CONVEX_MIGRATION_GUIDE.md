# Convex Folder Migration Guide

## Overview
This guide will help you move the `convex` folder from `src/convex/` to the project root `convex/`.

## Why Move Convex to Root?
- Standard Convex project structure
- Better separation of backend and frontend code
- Required for proper Railway deployment
- Cleaner project organization

## Migration Steps

### Step 1: Move the Convex Folder

**Windows (PowerShell):**
```powershell
# From project root
Move-Item -Path "src\convex" -Destination "convex"
```

**Windows (Command Prompt):**
```cmd
# From project root
move src\convex convex
```

**Mac/Linux:**
```bash
# From project root
mv src/convex convex
```

### Step 2: Verify the Structure

After moving, your project should look like:
```
spijker-image/
├── convex/                    # ← Moved here
│   ├── _generated/
│   ├── auth/
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── http.ts
│   ├── schema.ts
│   ├── tsconfig.json
│   └── users.ts
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── ...
└── convex.json               # ← Already updated
```

### Step 3: Update Imports (If Any)

Check if any files import from convex. Search for:
- `from '@/convex'`
- `from './convex'`
- `from '../convex'`

If found, update them to:
```typescript
// Old (if in src/)
import { api } from '@/convex/_generated/api'

// New
import { api } from '../convex/_generated/api'
```

### Step 4: Verify Configuration

The `convex.json` has already been updated to:
```json
{
  "functions": "convex/"
}
```

### Step 5: Test Locally

1. **Stop any running dev servers**

2. **Regenerate Convex types:**
```bash
npx convex dev
```

3. **Start your dev server:**
```bash
pnpm run dev
```

4. **Verify everything works:**
   - Authentication should work
   - No import errors in console
   - Convex functions are accessible

### Step 6: Deploy to Convex

After moving and testing locally:

```bash
# Deploy to production
npx convex deploy --prod
```

## Troubleshooting

### Error: "Cannot find module 'convex/_generated/api'"

**Solution:** Regenerate Convex types
```bash
npx convex dev
```

### Error: "Module not found: Error: Can't resolve '@/convex'"

**Solution:** Update the import path
```typescript
// Change from:
import { api } from '@/convex/_generated/api'

// To:
import { api } from '../convex/_generated/api'
```

### Convex dev not starting

**Solution:** 
1. Check `convex.json` points to `"functions": "convex/"`
2. Ensure the convex folder exists at project root
3. Delete `.convex` folder and restart: `npx convex dev`

## Verification Checklist

- [ ] Convex folder moved to project root
- [ ] `convex.json` updated to `"functions": "convex/"`
- [ ] No import errors when running `pnpm run dev`
- [ ] `npx convex dev` runs without errors
- [ ] Authentication works
- [ ] All Convex functions accessible
- [ ] Production deployment successful: `npx convex deploy --prod`

## Post-Migration

After successful migration:

1. **Update .gitignore** (already done):
   ```
   .convex
   ```

2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Move convex folder to project root"
   git push
   ```

3. **Deploy to Railway:**
   - Railway will automatically redeploy
   - Verify environment variables are set
   - Check deployment logs

## Important Notes

- The `_generated` folder will be recreated by Convex
- Don't manually edit files in `_generated/`
- Always run `npx convex dev` after moving the folder
- Test thoroughly before deploying to production

## Need Help?

If you encounter issues:
1. Check Convex logs: `npx convex logs`
2. Verify folder structure matches the guide
3. Ensure `convex.json` is correct
4. Try deleting `.convex` and regenerating
