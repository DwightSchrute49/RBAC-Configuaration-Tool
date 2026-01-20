# RBAC Configuration Tool

A full-stack Role-Based Access Control (RBAC) management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 📖 What is RBAC?

**Role-Based Access Control (RBAC)** is a security model that restricts system access based on user roles. Instead of assigning permissions directly to individual users, you:

1. **Create Permissions** - Define what actions can be performed (e.g., "edit_articles", "delete_users", "view_reports")
2. **Create Roles** - Define job functions or responsibilities (e.g., "Editor", "Admin", "Viewer")
3. **Assign Permissions to Roles** - Give each role the permissions it needs (e.g., Editor role gets "edit_articles" permission)
4. **Assign Roles to Users** - Users inherit all permissions from their assigned roles

**Benefits of RBAC:**

- **Simplified Management**: Change one role instead of updating each user individually
- **Better Security**: Users only get the permissions they need for their job
- **Scalability**: Easy to add new users by assigning existing roles
- **Audit Trail**: Clear understanding of who can do what in the system

**Example:**

- Create a "Content Editor" role with permissions: "create_post", "edit_post", "delete_own_post"
- Assign this role to all your content team members
- If you need to add a new permission (e.g., "publish_post"), add it once to the role and all editors automatically get it

## 🚀 Features

### Core Features

- **Custom Authentication System**
  - JWT-based authentication with bcrypt password hashing
  - Secure login/signup with HTTP-only cookies
  - Protected routes with middleware
  - **Root + IAM Authorization Model**:
    - **Root Users** (`.root` emails): Full system access
    - **Admin Users** (`.admin` emails): Can manage roles and permissions
    - **Regular Users**: Read-only access to dashboard

- **Permission Management**
  - Create, Read, Update, Delete (CRUD) permissions
  - Track which roles use each permission
  - User-friendly interface for managing permissions

- **Role Management**
  - Full CRUD operations for roles
  - View and manage role-permission associations
  - Intuitive role configuration interface

- **Role-Permission Mapping**
  - Assign multiple permissions to roles
  - Visual interface to see all permissions for a role
  - Easy permission assignment with checkboxes

- **User Management**
  - View all registered users
  - Assign roles to users
  - Track role assignments per user

- **Authorization System**
  - **Root Users** (emails ending with `.root`): Full administrative access
  - **Admin Users** (emails ending with `.admin`): Can create/update/delete permissions and roles
  - **Regular Users**: Can view dashboard but cannot modify permissions or roles
  - 403 error handling with user-friendly alerts for unauthorized actions

### 🌟 Bonus Feature: AI Natural Language Configuration

- Use plain English commands to configure RBAC
- Powered by Google Gemini AI
- Example commands:
  - "Create a new permission called publish content"
  - "Give the role Content Editor the permission to edit articles"
  - "Create a new role called Support Agent"

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI with Radix UI primitives
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager
- (Optional) Google Gemini API key for AI features

## 🔧 Installation & Setup

### 1. Clone or Download the Project

```bash
cd rbac
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
GEMINI_API_KEY="your-gemini-api-key-here"
```

**Configuration Details:**

- **DATABASE_URL**: Your PostgreSQL connection string
  - For local: `postgresql://user:password@localhost:5432/rbac_db`
  - For cloud (e.g., Neon, Supabase): Use the provided connection string
- **JWT_SECRET**: A random secret key for JWT tokens (generate one with `openssl rand -base64 32`)

- **GEMINI_API_KEY**: Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
rbac/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── permissions/   # Permission CRUD
│   │   │   ├── roles/         # Role CRUD
│   │   │   └── nl-command/    # AI natural language API
│   │   ├── auth/              # Login/Signup pages
│   │   ├── dashboard/         # Main dashboard
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # Shadcn UI components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Auth utilities
│   │   └── utils.ts           # Helper functions
│   └── middleware.ts          # Route protection
├── .env                       # Environment variables
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Tables

**users**

- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `password` (Text, Hashed)
- `created_at` (Timestamp)

**permissions**

- `id` (UUID, Primary Key)
- `name` (Text, Unique)
- `description` (Text, Optional)
- `created_at` (Timestamp)

**roles**

- `id` (UUID, Primary Key)
- `name` (Text, Unique)
- `created_at` (Timestamp)

**role_permissions** (Junction Table)

- `role_id` (UUID, Foreign Key → roles)
- `permission_id` (UUID, Foreign Key → permissions)

**user_roles** (Junction Table)

- `user_id` (UUID, Foreign Key → users)
- `role_id` (UUID, Foreign Key → roles)

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Permissions

- `GET /api/permissions` - List all permissions
- `POST /api/permissions` - Create new permission **(Root/Admin only)**
- `GET /api/permissions/[id]` - Get single permission
- `PUT /api/permissions/[id]` - Update permission **(Root/Admin only)**
- `DELETE /api/permissions/[id]` - Delete permission **(Root/Admin only)**

### Roles

- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role **(Root/Admin only)**
- `GET /api/roles/[id]` - Get single role
- `PUT /api/roles/[id]` - Update role **(Root/Admin only)**
- `DELETE /api/roles/[id]` - Delete role **(Root/Admin only)**
- `POST /api/roles/[id]/permissions` - Assign permissions to role **(Root/Admin only)**

### Users

- `GET /api/users` - List all users with their roles
- `POST /api/users/[id]/roles` - Assign roles to user **(Root/Admin only)**

### AI Natural Language

- `POST /api/nl-command` - Execute natural language command

## 🎯 Usage Guide

### 1. Create an Account

1. Navigate to the landing page
2. Click "Sign Up"
3. Enter your email and password
   - **For Admin Access**: Use an email ending with `.admin` (e.g., `admin@company.admin`)
   - **For Root Access**: Use an email ending with `.root` (e.g., `superuser@company.root`)
   - **Regular User**: Any other email format
4. Click "Sign Up"

**Authorization Levels:**

- **Root Users** (`.root`): Full system access, can manage everything
- **Admin Users** (`.admin`): Can create, update, and delete permissions and roles
- **Regular Users**: Can view the dashboard but cannot modify permissions or roles

### 2. Manage Permissions (Root/Admin Only)

1. Go to the Dashboard → Permissions tab
2. Click "New Permission"
3. Enter permission name (e.g., `can_edit_articles`)
4. Add an optional description
5. Click "Create"

**Note**: Only users with `.root` or `.admin` emails can create, edit, or delete permissions.

### 3. Manage Roles (Root/Admin Only)

1. Go to the Dashboard → Roles tab
2. Click "New Role"
3. Enter role name (e.g., `Content Editor`)
4. Click "Create"

**Note**: Only users with `.root` or `.admin` emails can create, edit, or delete roles.

### 4. Assign Permissions to Roles (Root/Admin Only)

1. In the Roles tab, find your role
2. Click "Assign"
3. Check the permissions you want to assign
4. Click "Assign"

### 5. Manage Users (All Users Can View)

1. Go to the Dashboard → Users tab
2. View all registered users and their assigned roles
3. **Root/Admin Only**: Click "Assign Roles" to modify user role assignments

### 5. Use AI Natural Language Commands (Root/Admin Only)

1. Click the "AI Command" button
2. Type a command like:
   - "Create a new permission called manage users"
   - "Assign the edit articles permission to Content Editor role"
3. Click "Execute"

**Note**: AI commands that create or modify permissions/roles require Root or Admin access.

## 🚀 Deployment to Vercel

### Step 1: Set Up Database

Use a cloud PostgreSQL provider:

- [Neon](https://neon.tech/) - Recommended
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the Vercel Dashboard:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
4. Deploy

### Step 3: Run Migrations on Production

```bash
# After deployment, run migrations
npx prisma migrate deploy
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**

- [ ] Sign up with a regular account
- [ ] Sign up with `.admin` email (e.g., `test.admin`)
- [ ] Sign up with `.root` email (e.g., `test.root`)
- [ ] Login with existing account
- [ ] Logout

**Permissions (Root/Admin Only):**

- [ ] Create a permission as Admin/Root user
- [ ] Edit a permission as Admin/Root user
- [ ] Delete a permission as Admin/Root user
- [ ] Try to create permission as regular user (should show 403 error)

**Roles (Root/Admin Only):**

- [ ] Create a role as Admin/Root user
- [ ] Edit a role as Admin/Root user
- [ ] Assign permissions to role as Admin/Root user
- [ ] Delete a role as Admin/Root user
- [ ] Try to create role as regular user (should show 403 error)

**Users:**

- [ ] View all users in Users tab
- [ ] Assign roles to user as Admin/Root
- [ ] Try to assign roles as regular user (should show 403 error)

**AI Features:**

- [ ] Test AI natural language command as Admin/Root
- [ ] Verify commands execute successfully

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens stored in HTTP-only cookies
- CSRF protection via SameSite cookies
- Protected API routes with middleware
- Secure token verification on all requests
- Environment variables for sensitive data

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Dark mode compatible
- Loading states
- Error handling
- Confirmation dialogs for destructive actions
- Real-time updates after mutations

## 📝 Environment Variables Reference

| Variable       | Required | Description                           | Example                                    |
| -------------- | -------- | ------------------------------------- | ------------------------------------------ |
| DATABASE_URL   | Yes      | PostgreSQL connection string          | `postgresql://user:pass@localhost:5432/db` |
| JWT_SECRET     | Yes      | Secret key for JWT signing            | `your-secret-key-here`                     |
| GEMINI_API_KEY | No       | Google Gemini API key for AI features | `AIzaSyD...`                               |

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npx prisma generate
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```
