# BloodLink API — Happy Path Test Flow

Base URL: http://localhost:8000

## Prerequisites
1. MySQL running with `blood_management_system` database created
2. Schema applied: `mysql -u root blood_management_system < schema.sql`
3. Seed data loaded: `mysql -u root blood_management_system < seed.sql`
4. Server running: `uvicorn main:app --reload`

---

## Step 1 — Health Check
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"ok","database":"connected"}`

---

## Step 2 — Register a New Donor
```bash
curl -X POST http://localhost:8000/donors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "age": 30,
    "gender": "Male",
    "blood_group": "O+",
    "contact_number": "9999999999",
    "email": "testdonor@example.com",
    "address": "123 Test Street"
  }'
```
Expected: HTTP 201 with donor object including `donor_id`

---

## Step 3 — Create a Hospital
```bash
curl -X POST http://localhost:8000/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "city": "Mumbai",
    "contact_number": "0221111111",
    "email": "test@hospital.com",
    "address": "Test Hospital Road"
  }'
```
Expected: HTTP 201 with hospital object including `hospital_id`

---

## Step 4 — Create a Patient Request
```bash
curl -X POST http://localhost:8000/requests \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Test Patient",
    "blood_group": "O+",
    "quantity_needed": 2,
    "hospital_id": 1
  }'
```
Expected: HTTP 201 with request object including `request_id` and `status: "Pending"`

---

## Step 5 — Match Donors to Request
```bash
curl http://localhost:8000/match/1
```
Expected: HTTP 200 with list of O+ donors available and eligible (last_donated IS NULL or >= 90 days ago)

---

## Step 6 — Fulfill the Request via Stored Procedure
```bash
curl -X POST http://localhost:8000/requests/1/fulfill \
  -H "Content-Type: application/json" \
  -d '{"bank_id": 1}'
```
Expected: HTTP 200 `{"message":"Request fulfilled successfully","request_id":1}`

---

## Step 7 — Verify Request Status Changed
```bash
curl http://localhost:8000/requests/1
```
Expected: `"status": "Fulfilled"`

---

## Error Path Tests

### Duplicate contact number → 409
```bash
curl -X POST http://localhost:8000/donors \
  -H "Content-Type: application/json" \
  -d '{"name":"Dup","age":25,"gender":"Male","blood_group":"A+","contact_number":"9999999999"}'
```
Expected: HTTP 409 `{"detail":"Contact number already registered"}`

### Invalid hospital_id → 404
```bash
curl -X POST http://localhost:8000/requests \
  -H "Content-Type: application/json" \
  -d '{"patient_name":"X","blood_group":"A+","quantity_needed":1,"hospital_id":9999}'
```
Expected: HTTP 404 `{"detail":"Hospital not found"}`

### Cancel fulfilled request → 409
```bash
curl -X PUT http://localhost:8000/requests/1/cancel
```
Expected: HTTP 409 `{"detail":"Cannot cancel a fulfilled request"}`

### Insufficient blood units → 409
```bash
curl -X POST http://localhost:8000/requests/1/fulfill \
  -H "Content-Type: application/json" \
  -d '{"bank_id": 3}'
```
Expected: HTTP 409 `{"detail":"Insufficient blood units in bank"}`

---

## Filter Tests

### Filter donors by blood group
```bash
curl "http://localhost:8000/donors?blood_group=O%2B"
```

### Filter donors by availability
```bash
curl "http://localhost:8000/donors?availability_status=Available"
```

### List pending requests
```bash
curl http://localhost:8000/requests/pending
```

### Donor donation history
```bash
curl http://localhost:8000/donors/1/history
```
