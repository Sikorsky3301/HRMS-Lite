# Supabase Database Setup

## Quick Setup Steps

### 1. Get Your Supabase Connection String

1. Go to your Supabase project dashboard:
   - URL: https://supabase.com/dashboard/project/vsjbzdulstqalevloirf
   - Or navigate: https://supabase.com/dashboard → Select your project

2. Go to **Settings** → **Database**

3. Scroll down to **Connection string** section

4. You'll see two options:
   - **Connection pooling** (recommended for serverless/server apps)
   - **Direct connection** (for local development)

5. For local development, use the **Direct connection** tab:
   - Click on the **URI** format
   - Copy the connection string (it will look like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.vsjbzdulstqalevloirf.supabase.co:5432/postgres
     ```

6. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you forgot your password, go to **Settings** → **Database** → **Database password**
   - You can reset it if needed

### 2. Create .env File

Create a `.env` file in the `backend` folder with your connection string:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.vsjbzdulstqalevloirf.supabase.co:5432/postgres
PORT=5000
NODE_ENV=development
```

**Replace `YOUR_PASSWORD_HERE` with your actual Supabase database password!**

### 3. Install Dependencies and Run

```bash
cd backend
npm install
npm start
```

The app will automatically:
- Connect to your Supabase PostgreSQL database
- Create the required tables (`employees` and `attendance`)
- Start the API server

## Connection String Formats

### Direct Connection (for local development)
```
postgresql://postgres:[PASSWORD]@db.vsjbzdulstqalevloirf.supabase.co:5432/postgres
```

### Connection Pooling (for production/serverless)
```
postgresql://postgres.vsjbzdulstqalevloirf:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Troubleshooting

### "password authentication failed"
- Make sure you're using the correct database password
- Check Settings → Database → Database password in Supabase dashboard

### "connection refused" or "timeout"
- Make sure your IP is allowed (for local development, Supabase allows all IPs by default)
- Check if you're using the correct port (5432 for direct, 6543 for pooling)

### SSL Connection Issues
If you get SSL errors, add this to your `.env`:
```env
DATABASE_SSL=false
```
(Note: Supabase requires SSL, so this might not work. Check your connection string - it should include SSL parameters)

### "relation does not exist" errors
- The tables should be created automatically on first run
- Check the server logs for any schema creation errors
- You can verify tables in Supabase: Go to **Table Editor** in your Supabase dashboard

## Verify Connection

After starting the app, you should see:
```
PostgreSQL schema ready
HRMS Lite API running on port 5000
```

If you see errors, check:
1. Your `.env` file has the correct `DATABASE_URL`
2. The password in the connection string is correct
3. Your Supabase project is active (not paused)

## View Your Data in Supabase

Once the app creates tables, you can view them in Supabase:
1. Go to **Table Editor** in your Supabase dashboard
2. You should see `employees` and `attendance` tables
3. You can view, edit, and query data directly from the dashboard
