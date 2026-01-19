# Vercel Deployment Guide

## Step-by-Step Deployment

### 1. Prepare Database

Use **Neon** (recommended - free tier):

1. Go to https://neon.tech/
2. Sign up and create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/db`)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

#### Option B: Using Vercel Dashboard

1. Push code to GitHub
2. Go to https://vercel.com/
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (see below)
6. Click "Deploy"

### 3. Environment Variables in Vercel

Add these in Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/rbac_db?sslmode=require
JWT_SECRET=your-generated-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-optional
```

### 4. Run Database Migrations

After deployment:

```bash
# Set environment variable locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

### 5. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://rbac-config.vercel.app`)
2. Sign up for an account
3. Create permissions and roles
4. Test all features

## Alternative Database Providers

### Supabase

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Railway

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@[REGION].railway.app:[PORT]/railway"
```

### Heroku Postgres

```
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"
```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version (use 18+)

### Database Connection Issues

- Ensure SSL mode is enabled for cloud databases
- Check that database URL is correct
- Verify database is accessible from Vercel's region

### Prisma Client Issues

- Run `npx prisma generate` before deploying
- Add `postinstall` script in package.json (already included)

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for propagation

## Monitoring

- View logs in Vercel dashboard
- Set up error tracking (optional: Sentry)
- Monitor database performance in Neon/Supabase dashboard

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use strong DATABASE_URL password
- [ ] Enable SSL for database connections
- [ ] Don't commit .env file
- [ ] Use environment variables for all secrets

## Cost Estimation

- Vercel: Free (Hobby plan)
- Neon Database: Free (up to 512 MB)
- Gemini API: Free (up to 60 requests/minute)

**Total: $0/month for development and testing**

## Production Recommendations

For production use:

- Upgrade to Vercel Pro ($20/month)
- Use Neon Pro ($19/month) for better performance
- Add monitoring and analytics
- Set up automated backups
- Enable rate limiting
- Add CAPTCHA on signup

---

Your RBAC app should now be live! 🚀
