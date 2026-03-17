import logging
import os
from contextlib import contextmanager
from typing import Generator

import mysql.connector
from mysql.connector import pooling, Error as MySQLError
from fastapi import HTTPException

logger = logging.getLogger(__name__)

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}

_connection_pool: pooling.MySQLConnectionPool | None = None


def init_db_pool() -> None:
    global _connection_pool
    try:
        _connection_pool = pooling.MySQLConnectionPool(
            pool_name="bloodlink_pool",
            pool_size=5,
            pool_reset_session=True,
            **DB_CONFIG,
        )
        logger.info("Database connection pool initialised successfully.")
    except MySQLError as exc:
        logger.error("Failed to initialise DB pool: %s", exc)
        raise RuntimeError("Database unavailable") from exc


@contextmanager
def get_connection() -> Generator:
    global _connection_pool
    if _connection_pool is None:
        try:
            init_db_pool()
        except RuntimeError:
            raise HTTPException(status_code=503, detail="Database unavailable")
    conn = None
    try:
        conn = _connection_pool.get_connection()
        yield conn
        conn.commit()
    except MySQLError as exc:
        if conn:
            conn.rollback()
        logger.error("Database error: %s", exc)
        raise
    finally:
        if conn and conn.is_connected():
            conn.close()


def test_connection() -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
        return True
    except Exception as exc:
        logger.error("DB connection test failed: %s", exc)
        return False
