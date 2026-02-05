# HRMS Lite – FastAPI Backend

This is an alternative backend implementation for **HRMS Lite** using **FastAPI** and **PostgreSQL**.
It mirrors the existing Node/Express API so you can swap backends without changing the frontend.

## Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL (via `DATABASE_URL`, e.g. Supabase)

## Project Structure

- `app/main.py` – FastAPI app entrypoint, routes mounting
- `app/db.py` – Database engine/session handling
- `app/models.py` – SQLAlchemy models (`Employee`, `Attendance`)
- `app/schemas.py` – Pydantic models (request/response DTOs)
- `app/routers/employees.py` – `/api/employees` endpoints
- `app/routers/attendance.py` – `/api/attendance` endpoints

## Environment Variables

Create `.env` in `fastapi-backend` (or set these in your environment):

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8000
```

For Supabase, you can reuse the same **connection pooler** URL you used for the Node backend.

## Install & Run (local)

```bash
cd fastapi-backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000/api/...`.

## API Surface (mirrors Node backend)

- `GET /api/health`
- `GET /api/employees`
- `POST /api/employees`
- `DELETE /api/employees/{id}`
- `GET /api/attendance` (query: `employee_id`, `date`)
- `GET /api/attendance/employee/{employee_id}` (optional `date`)
- `GET /api/attendance/stats/{employee_id}`
- `POST /api/attendance`

> Note: The schema is compatible with the existing PostgreSQL tables used by the Node backend.

