import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from mysql.connector import Error as MySQLError

from database import get_connection
from models.hospital import HospitalCreate, HospitalResponse
from models.request import PatientRequestResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=HospitalResponse, status_code=201)
def create_hospital(hospital: HospitalCreate):
    sql = """
        INSERT INTO hospital (name, city, contact_number, email, address)
        VALUES (%s, %s, %s, %s, %s)
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                hospital.name, hospital.city, hospital.contact_number,
                hospital.email, hospital.address,
            ))
            hosp_id = cursor.lastrowid
            cursor.execute("SELECT * FROM hospital WHERE hospital_id = %s", (hosp_id,))
            row = cursor.fetchone()
            cursor.close()
        return HospitalResponse(**row)
    except MySQLError as exc:
        logger.error("DB error creating hospital: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("", response_model=List[HospitalResponse])
def list_hospitals():
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM hospital ORDER BY created_at DESC")
            rows = cursor.fetchall()
            cursor.close()
        return [HospitalResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing hospitals: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital(hospital_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM hospital WHERE hospital_id = %s", (hospital_id,))
            row = cursor.fetchone()
            cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail="Hospital not found")
        return HospitalResponse(**row)
    except MySQLError as exc:
        logger.error("DB error fetching hospital %s: %s", hospital_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{hospital_id}/requests", response_model=List[PatientRequestResponse])
def hospital_requests(
    hospital_id: int,
    status: Optional[str] = Query(None),
):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            # verify hospital exists
            cursor.execute("SELECT hospital_id FROM hospital WHERE hospital_id = %s", (hospital_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Hospital not found")

            conditions = ["pr.hospital_id = %s"]
            params: list = [hospital_id]
            if status:
                conditions.append("pr.status = %s")
                params.append(status)

            where = " AND ".join(conditions)
            sql = f"""
                SELECT pr.*, h.name AS hospital_name
                FROM patient_request pr
                JOIN hospital h ON pr.hospital_id = h.hospital_id
                WHERE {where}
                ORDER BY pr.request_date DESC
            """
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            cursor.close()
        return [PatientRequestResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error fetching hospital requests %s: %s", hospital_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
