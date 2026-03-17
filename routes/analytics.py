from fastapi import APIRouter, HTTPException
from mysql.connector import Error as MySQLError

from database import get_connection

router = APIRouter()

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]


@router.get("")
def get_analytics():
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # ── KPIs ────────────────────────────────────────────────────────────
            cursor.execute(
                "SELECT COUNT(*) AS total_donors, "
                "SUM(availability_status = 'Available') AS available_donors "
                "FROM donor"
            )
            donor_row = cursor.fetchone()
            total_donors = donor_row["total_donors"] or 0
            available_donors = int(donor_row["available_donors"] or 0)

            cursor.execute(
                "SELECT COUNT(*) AS total_requests, "
                "SUM(status = 'Fulfilled') AS fulfilled_requests, "
                "SUM(status = 'Pending') AS pending_requests "
                "FROM patient_request"
            )
            req_row = cursor.fetchone()
            total_requests = req_row["total_requests"] or 0
            fulfilled_requests = int(req_row["fulfilled_requests"] or 0)
            pending_requests = int(req_row["pending_requests"] or 0)

            fulfilment_rate = (
                round(fulfilled_requests / total_requests * 100, 1) if total_requests else 0.0
            )

            kpis = {
                "total_donors": total_donors,
                "available_donors": available_donors,
                "total_requests": total_requests,
                "fulfilled_requests": fulfilled_requests,
                "pending_requests": pending_requests,
                "fulfilment_rate": fulfilment_rate,
            }

            # ── Blood-group demand ───────────────────────────────────────────────
            cursor.execute(
                "SELECT blood_group, COUNT(*) AS cnt FROM patient_request GROUP BY blood_group"
            )
            req_by_group = {row["blood_group"]: row["cnt"] for row in cursor.fetchall()}

            cursor.execute(
                "SELECT blood_group, COUNT(*) AS cnt FROM donor GROUP BY blood_group"
            )
            donors_by_group = {row["blood_group"]: row["cnt"] for row in cursor.fetchall()}

            blood_group_demand = [
                {
                    "group": bg,
                    "requests": req_by_group.get(bg, 0),
                    "donors": donors_by_group.get(bg, 0),
                }
                for bg in BLOOD_GROUPS
            ]

            # ── Hospital stats ───────────────────────────────────────────────────
            cursor.execute(
                "SELECT h.name AS hospital, "
                "COUNT(pr.request_id) AS requests, "
                "SUM(pr.status = 'Fulfilled') AS fulfilled, "
                "SUM(pr.status = 'Pending') AS pending "
                "FROM patient_request pr "
                "JOIN hospital h ON pr.hospital_id = h.hospital_id "
                "GROUP BY h.hospital_id, h.name "
                "ORDER BY requests DESC"
            )
            hospital_stats = []
            for row in cursor.fetchall():
                reqs = row["requests"] or 0
                ful = int(row["fulfilled"] or 0)
                pend = int(row["pending"] or 0)
                rate = round(ful / reqs * 100) if reqs else 0
                hospital_stats.append(
                    {
                        "hospital": row["hospital"],
                        "requests": reqs,
                        "fulfilled": ful,
                        "pending": pend,
                        "rate": rate,
                    }
                )

            # ── Leaderboard ──────────────────────────────────────────────────────
            cursor.execute(
                "SELECT d.donor_id, d.name, d.blood_group, COUNT(dr.donation_id) AS donations "
                "FROM donation_record dr "
                "JOIN donor d ON dr.donor_id = d.donor_id "
                "GROUP BY d.donor_id, d.name, d.blood_group "
                "ORDER BY donations DESC "
                "LIMIT 5"
            )
            leaderboard = [
                {
                    "donor_id": row["donor_id"],
                    "name": row["name"],
                    "blood_group": row["blood_group"],
                    "donations": row["donations"],
                }
                for row in cursor.fetchall()
            ]

            cursor.close()

        return {
            "kpis": kpis,
            "blood_group_demand": blood_group_demand,
            "hospital_stats": hospital_stats,
            "leaderboard": leaderboard,
        }

    except MySQLError as exc:
        raise HTTPException(status_code=503, detail=f"Database error: {exc}")
