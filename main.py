import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db_pool, test_connection
from routes import donors, blood_banks, hospitals, requests, donations, matching, auth, analytics
from routes import blood_camp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BloodLink API",
    description="Emergency Blood Availability and Donor Matching System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bloodlink-beryl.vercel.app",
        "https://bloodlink-9x0s5424s-kishoreraammmct2024-8350s-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    status_code = exc.status_code if isinstance(exc, HTTPException) else 500
    detail = exc.detail if isinstance(exc, HTTPException) else "Internal server error"
    origin = request.headers.get("origin", "")
    allowed = [
        "https://bloodlink-beryl.vercel.app",
        "https://bloodlink-9x0s5424s-kishoreraammmct2024-8350s-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    headers = {}
    if origin in allowed:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(status_code=status_code, content={"detail": detail}, headers=headers)


app.include_router(donors.router,      prefix="/donors",       tags=["Donors"])
app.include_router(blood_banks.router, prefix="/blood-banks",  tags=["Blood Banks"])
app.include_router(hospitals.router,   prefix="/hospitals",    tags=["Hospitals"])
app.include_router(requests.router,    prefix="/requests",     tags=["Patient Requests"])
app.include_router(donations.router,   prefix="/donations",    tags=["Donations"])
app.include_router(matching.router,    tags=["Matching"])
app.include_router(auth.router,        prefix="/auth",         tags=["Auth"])
app.include_router(analytics.router,   prefix="/analytics",    tags=["Analytics"])
app.include_router(blood_camp.router,  prefix="/camps",         tags=["Blood Camps"])


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Initialising database connection pool...")
    try:
        init_db_pool()
        logger.info("Database connection verified successfully.")
    except RuntimeError as exc:
        logger.warning("Database unavailable on startup: %s — endpoints will return 503 until DB is reachable.", exc)


@app.get("/health", tags=["Health"])
def health_check():
    db_ok = test_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
    }
