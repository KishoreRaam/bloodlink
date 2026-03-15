import logging
from typing import List

from fastapi import APIRouter, HTTPException
from mysql.connector import Error as MySQLError

from database import get_connection
from models.blood_bank import BloodBankCreate, BloodBankResponse, BloodBankUnitsUpdate

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=BloodBankResponse, status_code=201)
def create_blood_bank(bank: BloodBankCreate):
    sql = """
        INSERT INTO blood_bank (name, city, contact_number, email, available_units, blood_group)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                bank.name, bank.city, bank.contact_number,
                bank.email, bank.available_units, bank.blood_group,
            ))
            bank_id = cursor.lastrowid
            cursor.execute("SELECT * FROM blood_bank WHERE bloodbank_id = %s", (bank_id,))
            row = cursor.fetchone()
            cursor.close()
        return BloodBankResponse(**row)
    except MySQLError as exc:
        logger.error("DB error creating blood bank: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("", response_model=List[BloodBankResponse])
def list_blood_banks():
    sql = """
        SELECT
            bb.*,
            COUNT(dr.donation_id) AS total_donations
        FROM blood_bank bb
        LEFT JOIN donation_record dr ON bb.bloodbank_id = dr.bloodbank_id
        GROUP BY bb.bloodbank_id
        ORDER BY bb.created_at DESC
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql)
            rows = cursor.fetchall()
            cursor.close()
        return [BloodBankResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing blood banks: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{bank_id}", response_model=BloodBankResponse)
def get_blood_bank(bank_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM blood_bank WHERE bloodbank_id = %s", (bank_id,))
            row = cursor.fetchone()
            cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail="Blood bank not found")
        return BloodBankResponse(**row)
    except MySQLError as exc:
        logger.error("DB error fetching blood bank %s: %s", bank_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.put("/{bank_id}/units", response_model=BloodBankResponse)
def update_units(bank_id: int, body: BloodBankUnitsUpdate):
    if body.available_units < 0:
        raise HTTPException(status_code=400, detail="available_units cannot be negative")
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "UPDATE blood_bank SET available_units = %s WHERE bloodbank_id = %s",
                (body.available_units, bank_id),
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Blood bank not found")
            cursor.execute("SELECT * FROM blood_bank WHERE bloodbank_id = %s", (bank_id,))
            row = cursor.fetchone()
            cursor.close()
        return BloodBankResponse(**row)
    except MySQLError as exc:
        logger.error("DB error updating blood bank units %s: %s", bank_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
