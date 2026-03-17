const BASE_URL = "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("bl_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

// ---------- Auth (admin) ----------
export const loginUser = (email: string, password: string) =>
  request<{ access_token: string; token_type: string; user: { user_id: number; email: string; name: string; role: string; created_at: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );

// ---------- Donor auth ----------
export const donorLogin = (contact_number: string, password: string) =>
  request<DonorSession>("/donors/login", {
    method: "POST",
    body: JSON.stringify({ contact_number, password }),
  });

export const setDonorPassword = (contact_number: string, password: string) =>
  request<{ message: string }>("/donors/set-password", {
    method: "POST",
    body: JSON.stringify({ contact_number, password }),
  });

// ---------- Donors ----------
export const getDonors = (params?: { blood_group?: string; availability_status?: string }) => {
  const q = new URLSearchParams();
  if (params?.blood_group) q.set("blood_group", params.blood_group);
  if (params?.availability_status) q.set("availability_status", params.availability_status);
  const qs = q.toString();
  return request<Donor[]>(`/donors${qs ? `?${qs}` : ""}`);
};

export const getDonor = (id: number) => request<Donor>(`/donors/${id}`);

export const createDonor = (data: CreateDonorPayload) =>
  request<Donor>("/donors", { method: "POST", body: JSON.stringify(data) });

export const updateDonor = (id: number, data: Partial<CreateDonorPayload & { availability_status: string }>) =>
  request<Donor>(`/donors/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const getDonorHistory = (id: number) =>
  request<DonationHistory[]>(`/donors/${id}/history`);

// ---------- Hospitals ----------
export const getHospitals = () => request<Hospital[]>("/hospitals");

// ---------- Blood Banks ----------
export const getBloodBanks = () => request<BloodBank[]>("/blood-banks");

// ---------- Patient Requests ----------
export const createRequest = (data: CreateRequestPayload) =>
  request<PatientRequest>("/requests", { method: "POST", body: JSON.stringify(data) });

export const getRequests = (params?: { status?: string }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return request<PatientRequest[]>(`/requests${qs ? `?${qs}` : ""}`);
};

export const cancelRequest = (id: number) =>
  request<PatientRequest>(`/requests/${id}/cancel`, { method: "PUT" });

export const fulfillRequest = (requestId: number, bankId: number) =>
  request<{ message: string; request_id: number }>(
    `/requests/${requestId}/fulfill`,
    { method: "POST", body: JSON.stringify({ bank_id: bankId }) }
  );

// ---------- Matching ----------
export const matchDonors = (requestId: number) =>
  request<MatchResult>(`/match/${requestId}`);

// ---------- Blood Camps ----------
export const getCamps = (status?: string) => {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<BloodCamp[]>(`/camps${q}`);
};

export const createCamp = (data: CreateCampPayload) =>
  request<BloodCamp>("/camps", { method: "POST", body: JSON.stringify(data) });

export const updateCamp = (id: number, data: Partial<CreateCampPayload>) =>
  request<BloodCamp>(`/camps/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteCamp = (id: number) =>
  fetch(`${BASE_URL}/camps/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken() ?? ""}` },
  });

// ---------- Analytics ----------
export const getAnalytics = () => request<AnalyticsSummary>("/analytics");

// ======== Types ========

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

export interface DonorSession {
  donor_id: number;
  name: string;
  blood_group: string;
  availability_status: string;
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

export interface BloodBank {
  bloodbank_id: number;
  name: string;
  city: string;
  contact_number: string | null;
  email: string | null;
  available_units: number;
  blood_group: string;
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

export interface BloodCamp {
  camp_id: number;
  name: string;
  organizer: string | null;
  camp_date: string;       // YYYY-MM-DD
  start_time: string | null;  // HH:MM
  end_time: string | null;
  venue: string | null;
  city: string | null;
  capacity: number;
  blood_groups: string[];
  description: string | null;
  status: "Upcoming" | "Active" | "Completed";
  created_at: string;
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
  password?: string;
}

export interface CreateRequestPayload {
  patient_name: string;
  blood_group: string;
  quantity_needed: number;
  hospital_id: number;
}

export interface CreateCampPayload {
  name: string;
  organizer?: string;
  camp_date: string;    // YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  venue?: string;
  city?: string;
  capacity?: number;
  blood_groups?: string[];
  description?: string;
  status?: "Upcoming" | "Active" | "Completed";
}

export interface MatchResult {
  request_id: number;
  blood_group: string;
  message: string;
  donors: MatchedDonor[];
}

export interface DonationHistory {
  donation_id: number;
  donation_date: string;
  quantity_donated: number;
  notes: string | null;
  blood_bank_name: string;
  blood_bank_city: string;
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

export interface AnalyticsSummary {
  kpis: {
    total_donors: number;
    available_donors: number;
    total_requests: number;
    fulfilled_requests: number;
    pending_requests: number;
    fulfilment_rate: number;
  };
  blood_group_demand: { group: string; requests: number; donors: number }[];
  hospital_stats: { hospital: string; requests: number; fulfilled: number; pending: number; rate: number }[];
  leaderboard: { donor_id: number; name: string; blood_group: string; donations: number }[];
}
