import json
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from mysql.connector import Error as MySQLError

from database import get_connection
from models.blood_camp import BloodCampCreate, BloodCampUpdate, BloodCampResponse

logger = logging.getLogger(__name__)
router = APIRouter()


def _deserialize(row: dict) -> BloodCampResponse:
    raw = row.get("blood_groups") or "[]"
    if isinstance(raw, str):
        try:
            row["blood_groups"] = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            row["blood_groups"] = []
    return BloodCampResponse(**row)


@router.post("", response_model=BloodCampResponse, status_code=201)
def create_camp(camp: BloodCampCreate):
    sql = """
        INSERT INTO blood_camp
            (name, organizer, camp_date, start_time, end_time, venue, city,
             capacity, blood_groups, description, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                camp.name, camp.organizer, camp.camp_date,
                camp.start_time, camp.end_time, camp.venue, camp.city,
                camp.capacity, json.dumps(camp.blood_groups),
                camp.description, camp.status,
            ))
            camp_id = cursor.lastrowid
            cursor.execute("SELECT * FROM blood_camp WHERE camp_id = %s", (camp_id,))
            row = cursor.fetchone()
            cursor.close()
        return _deserialize(row)
    except MySQLError as exc:
        logger.error("DB error creating camp: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("", response_model=List[BloodCampResponse])
def list_camps(status: Optional[str] = Query(None)):
    where = "WHERE status = %s" if status else ""
    params = [status] if status else []
    sql = f"SELECT * FROM blood_camp {where} ORDER BY camp_date ASC, created_at DESC"
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            cursor.close()
        return [_deserialize(r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing camps: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{camp_id}", response_model=BloodCampResponse)
def get_camp(camp_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM blood_camp WHERE camp_id = %s", (camp_id,))
            row = cursor.fetchone()
            cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail="Camp not found")
        return _deserialize(row)
    except MySQLError as exc:
        logger.error("DB error fetching camp %s: %s", camp_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.put("/{camp_id}", response_model=BloodCampResponse)
def update_camp(camp_id: int, body: BloodCampUpdate):
    raw = body.model_dump(exclude_none=True)
    if not raw:
        raise HTTPException(status_code=400, detail="No fields provided")
    if "blood_groups" in raw:
        raw["blood_groups"] = json.dumps(raw["blood_groups"])
    if "camp_date" in raw:
        raw["camp_date"] = str(raw["camp_date"])
    set_clause = ", ".join(f"{k} = %s" for k in raw)
    values = list(raw.values()) + [camp_id]
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                f"UPDATE blood_camp SET {set_clause} WHERE camp_id = %s", values
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Camp not found")
            cursor.execute("SELECT * FROM blood_camp WHERE camp_id = %s", (camp_id,))
            row = cursor.fetchone()
            cursor.close()
        return _deserialize(row)
    except MySQLError as exc:
        logger.error("DB error updating camp %s: %s", camp_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.delete("/{camp_id}", status_code=204)
def delete_camp(camp_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM blood_camp WHERE camp_id = %s", (camp_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Camp not found")
            cursor.close()
    except MySQLError as exc:
        logger.error("DB error deleting camp %s: %s", camp_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
