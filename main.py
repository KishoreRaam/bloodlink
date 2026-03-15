import logging

from fastapi import FastAPI

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

app.include_router(donors.router,      prefix="/donors",       tags=["Donors"])
app.include_router(blood_banks.router, prefix="/blood-banks",  tags=["Blood Banks"])
app.include_router(hospitals.router,   prefix="/hospitals",    tags=["Hospitals"])
app.include_router(requests.router,    prefix="/requests",     tags=["Patient Requests"])
app.include_router(donations.router,   prefix="/donations",    tags=["Donations"])
app.include_router(matching.router,    tags=["Matching"])


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Initialising database connection pool...")
    init_db_pool()
    if test_connection():
        logger.info("Database connection verified successfully.")
    else:
        logger.warning("Database connection test failed on startup.")


@app.get("/health", tags=["Health"])
def health_check():
    db_ok = test_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
    }
