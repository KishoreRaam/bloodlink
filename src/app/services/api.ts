const BASE_URL = "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

// ---------- Donors ----------
export const getDonors = (params?: { blood_group?: string; availability_status?: string }) => {
  const q = new URLSearchParams();
  if (params?.blood_group) q.set("blood_group", params.blood_group);
  if (params?.availability_status) q.set("availability_status", params.availability_status);
  const qs = q.toString();
  return request<Donor[]>(`/donors${qs ? `?${qs}` : ""}`);
};

export const createDonor = (data: CreateDonorPayload) =>
  request<Donor>("/donors", { method: "POST", body: JSON.stringify(data) });

// ---------- Hospitals ----------
export const getHospitals = () => request<Hospital[]>("/hospitals");

// ---------- Patient Requests ----------
export const createRequest = (data: CreateRequestPayload) =>
  request<PatientRequest>("/requests", { method: "POST", body: JSON.stringify(data) });

export const getRequests = (params?: { status?: string }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return request<PatientRequest[]>(`/requests${qs ? `?${qs}` : ""}`);
};

// ---------- Matching ----------
export const matchDonors = (requestId: number) =>
  request<MatchResult>(`/match/${requestId}`);

// ---------- Types ----------
export interface Donor {
  donor_id: number;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  contact_number: string;
  email: string | null;
  address: string | null;
  availability_status: "Available" | "Not Available";
  last_donated: string | null;
  created_at: string;
}

export interface Hospital {
  hospital_id: number;
  name: string;
  city: string;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface PatientRequest {
  request_id: number;
  patient_name: string;
  blood_group: string;
  quantity_needed: number;
  hospital_id: number;
  status: "Pending" | "Fulfilled" | "Cancelled";
  request_date: string;
  hospital_name: string | null;
}

export interface CreateDonorPayload {
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  contact_number: string;
  email?: string;
  address?: string;
  availability_status?: string;
}

export interface CreateRequestPayload {
  patient_name: string;
  blood_group: string;
  quantity_needed: number;
  hospital_id: number;
}

export interface MatchResult {
  request_id: number;
  blood_group: string;
  message: string;
  donors: MatchedDonor[];
}

export interface MatchedDonor {
  donor_id: number;
  name: string;
  blood_group: string;
  contact_number: string;
  availability_status: string;
  last_donated: string | null;
  days_since_donation: number | null;
}
