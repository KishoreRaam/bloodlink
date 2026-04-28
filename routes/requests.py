import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from mysql.connector import Error as MySQLError

from database import get_connection
from models.request import PatientRequestCreate, PatientRequestResponse, FulfillRequest

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=PatientRequestResponse, status_code=201)
def create_request(req: PatientRequestCreate):
    sql = """
        INSERT INTO patient_request (patient_name, blood_group, quantity_needed, hospital_id)
        VALUES (%s, %s, %s, %s)
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (
                req.patient_name, req.blood_group, req.quantity_needed, req.hospital_id,
            ))
            req_id = cursor.lastrowid
            cursor.execute(
                """
                SELECT pr.*, h.name AS hospital_name
                FROM patient_request pr
                JOIN hospital h ON pr.hospital_id = h.hospital_id
                WHERE pr.request_id = %s
                """,
                (req_id,),
            )
            row = cursor.fetchone()
            cursor.close()
        return PatientRequestResponse(**row)
    except MySQLError as exc:
        if exc.errno == 1452:
            raise HTTPException(status_code=404, detail="Hospital not found")
        logger.error("DB error creating patient request: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("", response_model=List[PatientRequestResponse])
def list_requests(status: Optional[str] = Query(None)):
    conditions = []
    params = []
    if status:
        conditions.append("pr.status = %s")
        params.append(status)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql = f"""
        SELECT pr.*, h.name AS hospital_name
        FROM patient_request pr
        JOIN hospital h ON pr.hospital_id = h.hospital_id
        {where}
        ORDER BY pr.request_date DESC
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            cursor.close()
        return [PatientRequestResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing requests: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/pending", response_model=List[PatientRequestResponse])
def list_pending_requests():
    sql = """
        SELECT pr.*, h.name AS hospital_name
        FROM patient_request pr
        JOIN hospital h ON pr.hospital_id = h.hospital_id
        WHERE pr.status = 'Pending'
        ORDER BY pr.request_date ASC
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql)
            rows = cursor.fetchall()
            cursor.close()
        return [PatientRequestResponse(**r) for r in rows]
    except MySQLError as exc:
        logger.error("DB error listing pending requests: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.get("/{request_id}", response_model=PatientRequestResponse)
def get_request(request_id: int):
    sql = """
        SELECT pr.*, h.name AS hospital_name
        FROM patient_request pr
        JOIN hospital h ON pr.hospital_id = h.hospital_id
        WHERE pr.request_id = %s
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (request_id,))
            row = cursor.fetchone()
            cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail="Request not found")
        return PatientRequestResponse(**row)
    except MySQLError as exc:
        logger.error("DB error fetching request %s: %s", request_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.post("/{request_id}/fulfill")
def fulfill_request(request_id: int, body: FulfillRequest):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM patient_request WHERE request_id = %s", (request_id,))
            req = cursor.fetchone()
            if not req:
                raise HTTPException(status_code=404, detail="Request not found")
            if req["status"] != "Pending":
                raise HTTPException(status_code=409, detail=f"Request is already {req['status']}")

            cursor.execute("SELECT available_units FROM blood_bank WHERE bloodbank_id = %s", (body.bank_id,))
            bank = cursor.fetchone()
            if not bank:
                raise HTTPException(status_code=404, detail="Blood bank not found")
            if bank["available_units"] < req["quantity_needed"]:
                raise HTTPException(status_code=409, detail="Insufficient blood units in bank")

            cursor.execute(
                "UPDATE blood_bank SET available_units = available_units - %s WHERE bloodbank_id = %s",
                (req["quantity_needed"], body.bank_id),
            )
            cursor.execute(
                "UPDATE patient_request SET status = 'Fulfilled' WHERE request_id = %s",
                (request_id,),
            )
            cursor.close()
        return {"message": "Request fulfilled successfully", "request_id": request_id}
    except HTTPException:
        raise
    except MySQLError as exc:
        logger.error("DB error fulfilling request %s: %s", request_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.put("/{request_id}/cancel", response_model=PatientRequestResponse)
def cancel_request(request_id: int):
    sql = """
        SELECT pr.*, h.name AS hospital_name
        FROM patient_request pr
        JOIN hospital h ON pr.hospital_id = h.hospital_id
        WHERE pr.request_id = %s
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (request_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Request not found")
            if row["status"] == "Fulfilled":
                raise HTTPException(status_code=409, detail="Cannot cancel a fulfilled request")
            if row["status"] == "Cancelled":
                raise HTTPException(status_code=409, detail="Request is already cancelled")
            cursor.execute(
                "UPDATE patient_request SET status = 'Cancelled' WHERE request_id = %s",
                (request_id,),
            )
            cursor.execute(sql, (request_id,))
            updated = cursor.fetchone()
            cursor.close()
        return PatientRequestResponse(**updated)
    except MySQLError as exc:
        logger.error("DB error cancelling request %s: %s", request_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
