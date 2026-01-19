# RBAC Tool - Troubleshooting Guide

## 🔧 Common Issues & Solutions

### 1. Installation Issues

#### Problem: `npm install` fails

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rmdir /s /q node_modules
npm install

# Try with legacy peer deps
npm install --legacy-peer-deps

# Use different registry
npm install --registry=https://registry.npmjs.org/
```

#### Problem: "Cannot find module" errors

**Solution:**

```bash
# Regenerate package-lock.json
del package-lock.json
npm install
```

---

### 2. Database Issues

#### Problem: "Can't reach database server"

**Solutions:**

**For Local PostgreSQL:**

```bash
# Check if PostgreSQL is running
# Windows: Services → PostgreSQL service should be "Running"

# Test connection
psql -U postgres

# If not installed, download from:
# https://www.postgresql.org/download/windows/
```

**For Cloud Database (Recommended):**

```
1. Use Neon.tech (Free tier)
   → https://neon.tech/
   → Create project
   → Copy connection string
   → Update DATABASE_URL in .env

2. Alternative: Supabase
   → https://supabase.com/
   → New project
   → Database settings
   → Copy connection string
```

#### Problem: "Schema not found" or "Table doesn't exist"

**Solution:**

```bash
# Run migrations
npx prisma migrate dev --name init

# If that fails, try:
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

#### Problem: DATABASE_URL format issues

**Correct Format:**

```env
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Neon (cloud)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Supabase (cloud)
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"

# Note: Remove any quotes around the actual URL in .env file
```

---

### 3. Prisma Issues

#### Problem: "Prisma Client not found"

**Solution:**

```bash
# Generate Prisma Client
npx prisma generate

# If still not working
npm install @prisma/client
npx prisma generate
```

#### Problem: "Migration failed"

**Solutions:**

```bash
# Option 1: Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Option 2: Push schema directly
npx prisma db push

# Option 3: Check migration status
npx prisma migrate status
```

#### Problem: Type errors with Prisma

**Solution:**

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

### 4. Authentication Issues

#### Problem: "Unauthorized" on protected routes

**Possible Causes:**

1. **Cookie not set:**
   - Check browser DevTools → Application → Cookies
   - Should see a `token` cookie

2. **JWT_SECRET mismatch:**
   - Make sure .env has JWT_SECRET set
   - Restart server after changing .env

3. **Token expired:**
   - Token lasts 7 days
   - Login again to get new token

**Solutions:**

```bash
# 1. Check .env file
type .env
# Should see JWT_SECRET=...

# 2. Restart development server
# Press Ctrl+C to stop
npm run dev

# 3. Clear cookies and login again
# Browser DevTools → Application → Cookies → Clear All
```

#### Problem: "Invalid credentials" when logging in

**Solutions:**

1. **Wrong password:**
   - Passwords are case-sensitive
   - Try signing up with new account

2. **User doesn't exist:**
   - Check database with Prisma Studio
   - `npx prisma studio` → Open Users table

3. **Database connection issue:**
   - Verify DATABASE_URL in .env
   - Test with: `npx prisma db pull`

---

### 5. Build/Development Server Issues

#### Problem: Port 3000 already in use

**Solutions:**

```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

#### Problem: "Module not found" errors

**Solutions:**

```bash
# Check import paths
# Should use @ alias: import { ... } from '@/lib/...'

# Verify tsconfig.json has correct paths:
# "@/*": ["./src/*"]

# Restart TypeScript server
# VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### Problem: Hot reload not working

**Solutions:**

```bash
# Restart dev server
# Press Ctrl+C
npm run dev

# Clear .next folder
rmdir /s /q .next
npm run dev

# Check for file watcher limits (rare on Windows)
```

---

### 6. UI/Display Issues

#### Problem: Styles not loading

**Solutions:**

```bash
# Check Tailwind config
# tailwind.config.js should include all content paths

# Rebuild
npm run dev

# Clear browser cache
# DevTools → Network → Disable cache
```

#### Problem: Components not appearing

**Possible Issues:**

1. **JavaScript errors:**
   - Check browser Console (F12)
   - Fix any errors shown

2. **Import errors:**
   - Verify component imports
   - Check file paths are correct

3. **Props issues:**
   - Check TypeScript errors
   - Verify all required props passed

---

### 7. API Issues

#### Problem: API routes return 404

**Solutions:**

1. **Check file structure:**

   ```
   src/app/api/[endpoint]/route.ts
   ```

2. **Verify export:**

   ```typescript
   export async function GET(req: NextRequest) { ... }
   export async function POST(req: NextRequest) { ... }
   ```

3. **Check URL:**
   ```
   Correct: http://localhost:3000/api/permissions
   Wrong: http://localhost:3000/api/permissions/
   ```

#### Problem: "CORS errors" (rare in Next.js)

**Solution:**

```typescript
// Add to API route if needed
const response = NextResponse.json(data);
response.headers.set("Access-Control-Allow-Origin", "*");
return response;
```

#### Problem: API returns HTML instead of JSON

**Cause:** Middleware is redirecting
**Solution:**

```typescript
// In middleware.ts, check if path is API route
if (request.nextUrl.pathname.startsWith("/api/auth")) {
  return NextResponse.next(); // Don't redirect API auth routes
}
```

---

### 8. TypeScript Errors

#### Problem: Many "Cannot find module" errors

**Solution:**

```bash
# Install types
npm install --save-dev @types/node @types/react @types/react-dom

# Regenerate types
npx prisma generate

# Restart TypeScript
# VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### Problem: "Type 'unknown'" errors

**Solution:**

```typescript
// Add type guards
if (error instanceof z.ZodError) {
  return NextResponse.json({ error: error.errors }, { status: 400 });
}

// Or use type assertion (carefully)
const zodError = error as z.ZodError;
```

---

### 9. Environment Variables

#### Problem: Environment variables not working

**Solutions:**

1. **Restart server after .env changes:**

   ```bash
   # Press Ctrl+C, then:
   npm run dev
   ```

2. **Check .env location:**
   - Must be in project root
   - Not in src/ folder

3. **Check variable names:**
   - Must start with `NEXT_PUBLIC_` for client-side
   - Or use server-side only (no prefix)

4. **Verify in code:**
   ```typescript
   console.log("DB URL:", process.env.DATABASE_URL ? "Set" : "Not set");
   ```

---

### 10. Deployment Issues

#### Problem: Build fails on Vercel

**Solutions:**

1. **Check build locally:**

   ```bash
   npm run build
   # Fix any errors shown
   ```

2. **Verify environment variables:**
   - Add in Vercel dashboard
   - Project Settings → Environment Variables

3. **Check Node.js version:**
   - Should be 18.x or higher
   - Set in package.json:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

#### Problem: Database connection fails on Vercel

**Solutions:**

1. **Use connection pooling:**
   - Add `?pgbouncer=true` to DATABASE_URL
   - Example: `postgresql://...?pgbouncer=true&connection_limit=1`

2. **Run migrations:**

   ```bash
   # After deployment
   npx prisma migrate deploy
   ```

3. **Check SSL mode:**
   - Add `?sslmode=require` to DATABASE_URL

---

## 🆘 Quick Diagnostics

Run these commands to diagnose issues:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify packages installed
npm list --depth=0

# Check Prisma connection
npx prisma db pull

# View database
npx prisma studio

# Check for TypeScript errors
npx tsc --noEmit

# Build test
npm run build
```

---

## 📞 Still Need Help?

### 1. Check Documentation

- README.md - Complete guide
- QUICKSTART.md - Setup help
- DEPLOYMENT.md - Deployment help

### 2. Check Logs

```bash
# Development server logs
# Look for errors in terminal

# Browser console
# Press F12 → Console tab
```

### 3. Contact Support

For queries: **+91-7700000766 (Akshay Gaur)**

---

## 🎯 Most Common Issues (Top 5)

1. ❗ **DATABASE_URL not set**
   → Copy .env.example to .env and set URL

2. ❗ **Prisma Client not generated**
   → Run: `npx prisma generate`

3. ❗ **Port 3000 in use**
   → Run: `npm run dev -- -p 3001`

4. ❗ **JWT_SECRET not set**
   → Add to .env file

5. ❗ **Dependencies not installed**
   → Run: `npm install`

---

## ✅ Health Check Checklist

Before asking for help, verify:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running or cloud DB set up
- [ ] .env file exists with correct values
- [ ] `npm install` completed successfully
- [ ] `npx prisma generate` ran successfully
- [ ] No TypeScript errors in terminal
- [ ] Browser console has no errors
- [ ] Correct URL (http://localhost:3000)

---

**Most issues can be fixed by:**

1. Restarting the dev server
2. Regenerating Prisma Client
3. Clearing .next folder
4. Checking .env file

---

_Last updated: Project completion_
