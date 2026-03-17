import logging
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Query
from mysql.connector import Error as MySQLError

from database import get_connection
from models.donor import DonorCreate, DonorResponse, AvailabilityUpdate, DonorUpdate, DonorLogin, DonorSession
from auth_utils import hash_password, verify_password

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=DonorResponse, status_code=201)
def create_donor(donor: DonorCreate):
    sql = """
        INSERT INTO donor (name, age, gender, blood_group, contact_number, email, address,
                           availability_status, last_donated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                donor.name, donor.age, donor.gender, donor.blood_group,
                donor.contact_number, donor.email, donor.address,
                donor.availability_status or "Available",
                donor.last_donated,
            ))
            donor_id = cursor.lastrowid
            # If password provided (donor self-registration), create auth record
            if donor.password:
                cursor.execute(
                    "INSERT INTO donor_auth (donor_id, password_hash) VALUES (%s, %s)",
                    (donor_id, hash_password(donor.password)),
                )
            cursor.execute("SELECT * FROM donor WHERE donor_id = %s", (donor_id,))
            row = cursor.fetchone()
            cursor.close()
        return DonorResponse(**row)
    except MySQLError as exc:
        if exc.errno == 1062:
            raise HTTPException(status_code=409, detail="Contact number already registered")
        logger.error("DB error creating donor: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.post("/set-password", status_code=200)
def set_password(body: DonorLogin):
    """
    First-time password setup for donors who registered without one.
    Only works if the donor has NO existing password.
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT d.donor_id, da.auth_id "
                "FROM donor d "
                "LEFT JOIN donor_auth da ON d.donor_id = da.donor_id "
                "WHERE d.contact_number = %s",
                (body.contact_number,),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="No donor found with this phone number")
            if row.get("auth_id"):
                raise HTTPException(status_code=409, detail="Password already set. Use login instead.")
            cursor.execute(
                "INSERT INTO donor_auth (donor_id, password_hash) VALUES (%s, %s)",
                (row["donor_id"], hash_password(body.password)),
            )
            cursor.close()
        return {"message": "Password set successfully. You can now log in."}
    except HTTPException:
        raise
    except MySQLError as exc:
        logger.error("DB error setting donor password: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.post("/login", response_model=DonorSession)
def donor_login(body: DonorLogin):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT d.*, da.password_hash "
                "FROM donor d "
                "LEFT JOIN donor_auth da ON d.donor_id = da.donor_id "
                "WHERE d.contact_number = %s",
                (body.contact_number,),
            )
            row = cursor.fetchone()
            cursor.close()
    except MySQLError as exc:
        logger.error("DB error during donor login: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")

    if not row:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    if not row.get("password_hash"):
        raise HTTPException(status_code=401, detail="No password set for this account. Please contact admin.")
    if not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    return DonorSession(
        donor_id=row["donor_id"],
        name=row["name"],
        blood_group=row["blood_group"],
        availability_status=row["availability_status"],
    )


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


@router.put("/{donor_id}", response_model=DonorResponse)
def update_donor(donor_id: int, body: DonorUpdate):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values()) + [donor_id]
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(f"UPDATE donor SET {set_clause} WHERE donor_id = %s", values)
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Donor not found")
            cursor.execute("SELECT * FROM donor WHERE donor_id = %s", (donor_id,))
            row = cursor.fetchone()
            cursor.close()
        return DonorResponse(**row)
    except MySQLError as exc:
        if exc.errno == 1062:
            raise HTTPException(status_code=409, detail="Contact number already registered")
        logger.error("DB error updating donor %s: %s", donor_id, exc)
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
