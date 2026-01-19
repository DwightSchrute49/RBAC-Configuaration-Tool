# RBAC Configuration Tool - Quick Start Guide

## For Evaluators

This is a complete, production-ready RBAC management system with all required features:

### ✅ Completed Features

1. **Custom Authentication** (JWT + bcrypt)
2. **Permission Management** (Full CRUD)
3. **Role Management** (Full CRUD)
4. **Role-Permission Mapping** (Visual assignment interface)
5. **Natural Language AI** (Bonus feature using Gemini)

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Create .env file with your database URL
cp .env.example .env

# Edit .env and add your PostgreSQL connection string
# Then run:
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Run the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## Test Account

After running the app:

1. Go to http://localhost:3000/auth/signup
2. Create an account (any email/password)
3. Start managing permissions and roles!

## Key Demo Scenarios

### Scenario 1: Create Permission

1. Dashboard → Permissions tab
2. Click "New Permission"
3. Name: `can_edit_articles`
4. Description: `Allows editing articles`

### Scenario 2: Create Role

1. Dashboard → Roles tab
2. Click "New Role"
3. Name: `Content Editor`

### Scenario 3: Assign Permissions

1. Find the "Content Editor" role
2. Click "Assign"
3. Select permissions
4. Click "Assign"

### Scenario 4: AI Natural Language (Bonus)

1. Click "AI Command" button
2. Type: "Create a new permission called publish content"
3. Click "Execute"
4. See the permission created automatically!

## Tech Stack Verification

- ✅ Next.js 14 with TypeScript
- ✅ PostgreSQL with Prisma ORM
- ✅ JWT + bcrypt authentication
- ✅ Shadcn UI components
- ✅ Vercel deployment ready

## Database Schema

All 5 required tables implemented:

- `users` - User accounts
- `permissions` - System permissions
- `roles` - User roles
- `role_permissions` - Role-Permission junction
- `user_roles` - User-Role junction

## API Routes

All CRUD operations implemented:

- `/api/auth/*` - Authentication
- `/api/permissions` - Permission CRUD
- `/api/roles` - Role CRUD
- `/api/roles/[id]/permissions` - Role-Permission mapping
- `/api/nl-command` - AI natural language (bonus)

## Deployment

Ready for Vercel deployment:

```bash
vercel
```

Just add environment variables in Vercel dashboard.

## Notes

- All passwords are hashed with bcrypt
- JWT tokens in HTTP-only cookies
- Middleware protects all routes
- Responsive design
- Error handling
- Real-time updates

For questions: +91-7700000766 (Akshay Gaur)
