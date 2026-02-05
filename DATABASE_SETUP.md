# Database Setup Guide

This HRMS Lite app supports both **SQLite** (for local development) and **PostgreSQL** (for online/hosted deployments).

## Local Development (SQLite)

By default, the app uses SQLite. No configuration needed! Just run:

```bash
cd backend
npm install
npm start
```

The database file (`hrms.db`) will be created automatically in the `backend` folder.

## Online Database (PostgreSQL)

To use an online PostgreSQL database, you need to:

### 1. Get a PostgreSQL Database

Choose one of these free options:

#### Option A: Render (Recommended for Render deployments)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Fill in:
   - Name: `hrms-lite-db` (or any name)
   - Database: `hrms_lite`
   - User: `hrms_user` (or auto-generated)
   - Region: Choose closest to you
   - Plan: Free tier is fine for development
4. Click "Create Database"
5. Copy the **Internal Database URL** (for Render services) or **External Database URL** (for other hosts)

#### Option B: Supabase (Free tier available)
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the **Connection string** (URI format)

#### Option C: Neon (Free tier available)
1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the **Connection string** from the dashboard

#### Option D: Railway (Free tier available)
1. Go to [Railway](https://railway.app/)
2. Create a new project → Add PostgreSQL
3. Copy the **DATABASE_URL** from the variables tab

### 2. Set the DATABASE_URL Environment Variable

#### For Local Development:
Create a `.env` file in the `backend` folder:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

Or set it when running:
```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@host:port/database"; npm start

# Windows CMD
set DATABASE_URL=postgresql://user:password@host:port/database && npm start

# Linux/Mac
DATABASE_URL=postgresql://user:password@host:port/database npm start
```

#### For Render Deployment:
1. In your Render web service dashboard
2. Go to "Environment" tab
3. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: The connection string from your PostgreSQL service
4. If you created the PostgreSQL service in Render, you can link it:
   - Go to your web service → "Environment"
   - Click "Link Database" and select your PostgreSQL service
   - Render will automatically set `DATABASE_URL`

#### For Other Hosting Platforms:
Set the `DATABASE_URL` environment variable in your hosting platform's dashboard/environment settings.

### 3. Run the App

The app will automatically:
- Detect `DATABASE_URL` and use PostgreSQL
- Create the required tables on first run
- Use SQLite if `DATABASE_URL` is not set

```bash
cd backend
npm install
npm start
```

## Connection String Format

PostgreSQL connection strings follow this format:

```
postgresql://username:password@host:port/database
```

Or:

```
postgres://username:password@host:port/database
```

Example:
```
postgresql://hrms_user:mypassword123@dpg-xxxxx-a.oregon-postgres.render.com/hrms_lite
```

## Troubleshooting

### SSL Connection Issues
If you get SSL errors, you can disable SSL (not recommended for production):
```env
DATABASE_SSL=false
```

### Connection Refused
- Make sure your database host allows connections from your IP
- For Render: Use the **Internal Database URL** if deploying on Render, or whitelist your IP for external connections
- For Supabase/Neon: Check connection pooling settings

### Schema Not Created
- Check that the database user has CREATE TABLE permissions
- Check server logs for any error messages during schema initialization

## Switching Between SQLite and PostgreSQL

- **Use SQLite**: Don't set `DATABASE_URL` (or remove it)
- **Use PostgreSQL**: Set `DATABASE_URL` to your PostgreSQL connection string

The app automatically detects which database to use based on the `DATABASE_URL` environment variable.
