import logging
from typing import List

from fastapi import APIRouter, HTTPException
from mysql.connector import Error as MySQLError

from database import get_connection
from models.donation import DonationCreate, DonationResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=DonationResponse, status_code=201)
def create_donation(donation: DonationCreate):
    sql = """
        INSERT INTO donation_record (donor_id, bloodbank_id, donation_date, quantity_donated, notes)
        VALUES (%s, %s, %s, %s, %s)
    """
    fetch_sql = """
        SELECT dr.*, d.name AS donor_name, bb.name AS blood_bank_name
        FROM donation_record dr
        JOIN donor d ON dr.donor_id = d.donor_id
        JOIN blood_bank bb ON dr.bloodbank_id = bb.bloodbank_id
        WHERE dr.donation_id = %s
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                donation.donor_id, donation.bloodbank_id,
                donation.donation_date, donation.quantity_donated, donation.notes,
            ))
            donation_id = cursor.lastrowid
            # Replaces the DB trigger: update donor status after donation
            cursor.execute(
                "UPDATE donor SET availability_status = 'Not Available', last_donated = %s WHERE donor_id = %s",
                (donation.donation_date, donation.donor_id),
            )
            cursor.execute(fetch_sql, (donation_id,))
            row = cursor.fetchone()
            cursor.close()
        return DonationResponse(**row)
    except MySQLError as exc:
        if exc.errno == 1452:
            raise HTTPException(status_code=404, detail="Donor or blood bank not found")
        logger.error("DB error creating donation: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("", response_model=List[DonationResponse])
def list_donations():
    sql = """
        SELECT dr.*, d.name AS donor_name, bb.name AS blood_bank_name
        FROM donation_record dr
        JOIN donor d ON dr.donor_id = d.donor_id
        JOIN blood_bank bb ON dr.bloodbank_id = bb.bloodbank_id
        ORDER BY dr.donation_date DESC
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql)
            rows = cursor.fetchall()
            cursor.close()
        return [DonationResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing donations: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation(donation_id: int):
    sql = """
        SELECT dr.*, d.name AS donor_name, bb.name AS blood_bank_name
        FROM donation_record dr
        JOIN donor d ON dr.donor_id = d.donor_id
        JOIN blood_bank bb ON dr.bloodbank_id = bb.bloodbank_id
        WHERE dr.donation_id = %s
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (donation_id,))
            row = cursor.fetchone()
            cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail="Donation not found")
        return DonationResponse(**row)
    except MySQLError as exc:
        logger.error("DB error fetching donation %s: %s", donation_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
