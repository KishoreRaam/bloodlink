import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db_pool, test_connection
from routes import donors, blood_banks, hospitals, requests, donations, matching

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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(donors.router,      prefix="/donors",       tags=["Donors"])
app.include_router(blood_banks.router, prefix="/blood-banks",  tags=["Blood Banks"])
app.include_router(hospitals.router,   prefix="/hospitals",    tags=["Hospitals"])
app.include_router(requests.router,    prefix="/requests",     tags=["Patient Requests"])
app.include_router(donations.router,   prefix="/donations",    tags=["Donations"])
app.include_router(matching.router,    tags=["Matching"])


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
