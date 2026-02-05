import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .db import init_db
from .routers import employees, attendance


class HealthResponse(BaseModel):
    status: str
    message: str


def create_app() -> FastAPI:
    app = FastAPI(
        title="HRMS Lite API (FastAPI)",
        version="1.0.0",
        docs_url="/docs",
        openapi_url="/openapi.json",
    )

    # CORS: allow frontend dev & production origins
    origins = [
        "http://localhost:5173",
        "https://localhost:5173",
        # Add your Vercel frontend URL here when deployed
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # relax for assignment; tighten in real prod
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health", response_model=HealthResponse)
    def health_check():
        return HealthResponse(status="ok", message="HRMS Lite FastAPI backend is running")

    app.include_router(employees.router)
    app.include_router(attendance.router)

    return app


app = create_app()

# Initialize DB schema at startup
@app.on_event("startup")
def on_startup():
    init_db()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

