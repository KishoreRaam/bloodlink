import logging
from typing import List

from fastapi import APIRouter, HTTPException
from mysql.connector import Error as MySQLError

from database import get_connection
from models.donor import DonorResponse
from models.request import FulfillRequest

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/match/{request_id}")
def match_donors(request_id: int):
    """
    Find available donors whose blood group matches the patient request
    and who have not donated within the last 90 days.
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Step 1: fetch the patient request
            cursor.execute(
                "SELECT * FROM patient_request WHERE request_id = %s",
                (request_id,),
            )
            req = cursor.fetchone()
            if not req:
                raise HTTPException(status_code=404, detail="Patient request not found")

            blood_group = req["blood_group"]

            # Step 2: find eligible donors — 90-day gap enforced here
            match_sql = """
                SELECT
                    donor_id,
                    name,
                    age,
                    gender,
                    blood_group,
                    contact_number,
                    email,
                    address,
                    availability_status,
                    last_donated,
                    DATEDIFF(CURDATE(), last_donated) AS days_since_donation,
                    created_at
                FROM donor
                WHERE blood_group = %s
                  AND availability_status = 'Available'
                  AND (
                      last_donated IS NULL
                      OR last_donated <= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                  )
                ORDER BY last_donated ASC
            """
            cursor.execute(match_sql, (blood_group,))
            donors = cursor.fetchall()
            cursor.close()

        if not donors:
            return {
                "request_id": request_id,
                "blood_group": blood_group,
                "message": "No available donors found for this blood group",
                "donors": [],
            }

        return {
            "request_id": request_id,
            "blood_group": blood_group,
            "message": f"{len(donors)} matching donor(s) found",
            "donors": donors,
        }

    except MySQLError as exc:
        logger.error("DB error in donor matching for request %s: %s", request_id, exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.post("/requests/{request_id}/fulfill")
def fulfill_request(request_id: int, body: FulfillRequest):
    """
    Call the stored procedure fulfill_request(req_id, bank_id).
    Catches SQLSTATE 45000 (insufficient units) and returns HTTP 409.
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT request_id, status FROM patient_request WHERE request_id = %s",
                (request_id,),
            )
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Patient request not found")
            cursor.close()

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.callproc("fulfill_request", (request_id, body.bank_id))
            cursor.close()
        return {"message": "Request fulfilled successfully", "request_id": request_id}
    except MySQLError as exc:
        # SQLSTATE 45000 raised by the stored procedure
        if exc.sqlstate == "45000":
            raise HTTPException(status_code=409, detail=str(exc))
        if exc.errno == 1452:
            raise HTTPException(status_code=404, detail="Request or blood bank not found")
        logger.error("DB error fulfilling request %s: %s", request_id, exc)
        raise HTTPException(status_code=503, detail="Database error")
