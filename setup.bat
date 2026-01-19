@echo off
echo ================================================
echo RBAC Configuration Tool - Setup Script
echo ================================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo Step 2: Checking for .env file...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠ IMPORTANT: Please edit the .env file with your database URL
    echo Example: DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db"
    echo.
    pause
) else (
    echo ✓ .env file already exists
)
echo.

echo Step 3: Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 4: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma Client
    echo Make sure your DATABASE_URL is set correctly in .env
    pause
    exit /b 1
)
echo ✓ Prisma Client generated
echo.

echo Step 5: Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo.
    echo ⚠ Migration failed. This is normal if your database isn't set up yet.
    echo.
    echo Please:
    echo 1. Set up a PostgreSQL database
    echo 2. Update DATABASE_URL in .env file
    echo 3. Run: npx prisma migrate dev --name init
    echo.
) else (
    echo ✓ Database migrations complete
    echo.
)

echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Make sure your .env file has the correct DATABASE_URL
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo For help, see:
echo - README.md
echo - GETTING_STARTED.md
echo - QUICKSTART.md
echo.
echo ================================================
pause
