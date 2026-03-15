import logging
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Query
from mysql.connector import Error as MySQLError

from database import get_connection
from models.donor import DonorCreate, DonorResponse, AvailabilityUpdate

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=DonorResponse, status_code=201)
def create_donor(donor: DonorCreate):
    sql = """
        INSERT INTO donor (name, age, gender, blood_group, contact_number, email, address, last_donated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                donor.name, donor.age, donor.gender, donor.blood_group,
                donor.contact_number, donor.email, donor.address, donor.last_donated
            ))
            donor_id = cursor.lastrowid
            cursor.execute("SELECT * FROM donor WHERE donor_id = %s", (donor_id,))
            row = cursor.fetchone()
            cursor.close()
        return DonorResponse(**row)
    except MySQLError as exc:
        if exc.errno == 1062:
            raise HTTPException(status_code=409, detail="Contact number already registered")
        logger.error("DB error creating donor: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("", response_model=List[DonorResponse])
def list_donors(
    blood_group: Optional[str] = Query(None),
    availability_status: Optional[str] = Query(None),
):
    conditions = []
    params = []

    if blood_group:
        conditions.append("blood_group = %s")
        params.append(blood_group)
    if availability_status:
        conditions.append("availability_status = %s")
        params.append(availability_status)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql = f"SELECT * FROM donor {where} ORDER BY created_at DESC"

    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            cursor.close()
        return [DonorResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing donors: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{donor_id}", response_model=DonorResponse)
def get_donor(donor_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM donor WHERE donor_id = %s", (donor_id,))
            row = cursor.fetchone()
            cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail="Donor not found")
        return DonorResponse(**row)
    except MySQLError as exc:
        logger.error("DB error fetching donor %s: %s", donor_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.put("/{donor_id}/availability", response_model=DonorResponse)
def update_availability(donor_id: int, body: AvailabilityUpdate):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "UPDATE donor SET availability_status = %s WHERE donor_id = %s",
                (body.availability_status, donor_id),
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Donor not found")
            cursor.execute("SELECT * FROM donor WHERE donor_id = %s", (donor_id,))
            row = cursor.fetchone()
            cursor.close()
        return DonorResponse(**row)
    except MySQLError as exc:
        logger.error("DB error updating donor availability %s: %s", donor_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{donor_id}/history")
def donor_history(donor_id: int):
    sql = """
        SELECT
            dr.donation_id,
            dr.donation_date,
            dr.quantity_donated,
            dr.notes,
            bb.name  AS blood_bank_name,
            bb.city  AS blood_bank_city
        FROM donation_record dr
        JOIN blood_bank bb ON dr.bloodbank_id = bb.bloodbank_id
        WHERE dr.donor_id = %s
        ORDER BY dr.donation_date DESC
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            # verify donor exists
            cursor.execute("SELECT donor_id FROM donor WHERE donor_id = %s", (donor_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Donor not found")
            cursor.execute(sql, (donor_id,))
            rows = cursor.fetchall()
            cursor.close()
        return rows
    except MySQLError as exc:
        logger.error("DB error fetching donor history %s: %s", donor_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
