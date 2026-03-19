import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Loader2, Check } from "lucide-react";
import { createRequest, getHospitals, type Hospital } from "../services/api";

export type UrgencyLevel = "Critical" | "Urgent" | "Standard";

export interface EmergencyItem {
  id: string;
  patient_name: string;
  blood_group: string;
  units: number;
  hospital_id: number;
  hospital_name: string;
  urgency: UrgencyLevel;
  status: "Pending" | "In Progress" | "Fulfilled" | "Cancelled";
  created_at: string;
  request_id?: number;
}

const STORAGE_KEY = "bl_emergency_queue";

export function getEmergencyQueue(): EmergencyItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEmergencyQueue(items: EmergencyItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("emergencyQueueUpdated"));
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { inactiveBg: string; inactiveColor: string; activeBg: string; shadow: string }
> = {
  Critical: {
    inactiveBg: "#FEF2F2",
    inactiveColor: "#DC2626",
    activeBg: "#DC2626",
    shadow: "rgba(220,38,38,0.4)",
  },
  Urgent: {
    inactiveBg: "#FFF7ED",
    inactiveColor: "#EA580C",
    activeBg: "#EA580C",
    shadow: "rgba(234,88,12,0.4)",
  },
  Standard: {
    inactiveBg: "#EFF6FF",
    inactiveColor: "#2563EB",
    activeBg: "#2563EB",
    shadow: "rgba(37,99,235,0.4)",
  },
};

export function EmergencyAlertPanel({ onAdded }: { onAdded?: () => void }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [form, setForm] = useState({
    patientName: "",
    bloodGroup: "",
    units: "1",
    hospitalId: "",
  });
  const [urgency, setUrgency] = useState<UrgencyLevel>("Critical");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  const refreshCount = () => {
    const q = getEmergencyQueue();
    setActiveCount(
      q.filter((i) => i.status === "Pending" || i.status === "In Progress").length
    );
  };

  useEffect(() => {
    getHospitals().then(setHospitals).catch(() => {});
    refreshCount();
    window.addEventListener("emergencyQueueUpdated", refreshCount);
    return () => window.removeEventListener("emergencyQueueUpdated", refreshCount);
  }, []);

  const setField = (key: keyof typeof form, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientName.trim()) e.patientName = "Required";
    if (!form.bloodGroup) e.bloodGroup = "Required";
    if (!form.units || Number(form.units) < 1) e.units = "Min 1";
    if (!form.hospitalId) e.hospitalId = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await createRequest({
        patient_name: form.patientName,
        blood_group: form.bloodGroup,
        quantity_needed: Number(form.units),
        hospital_id: Number(form.hospitalId),
      });
      const hospital = hospitals.find((h) => h.hospital_id === Number(form.hospitalId));
      const newItem: EmergencyItem = {
        id: crypto.randomUUID(),
        patient_name: form.patientName,
        blood_group: form.bloodGroup,
        units: Number(form.units),
        hospital_id: Number(form.hospitalId),
        hospital_name: hospital?.name ?? "Unknown Hospital",
        urgency,
        status: "Pending",
        created_at: new Date().toISOString(),
        request_id: result.request_id,
      };
      const queue = getEmergencyQueue();
      saveEmergencyQueue([newItem, ...queue]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ patientName: "", bloodGroup: "", units: "1", hospitalId: "" });
        setUrgency("Critical");
        setErrors({});
      }, 2000);
      onAdded?.();
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(220,38,38,0.0)",
          "0 0 28px 6px rgba(220,38,38,0.18)",
          "0 0 0 0 rgba(220,38,38,0.0)",
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50"
      style={{ borderLeft: "4px solid #DC2626" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[#F3F4F6] dark:border-gray-700/30">
        <motion.div
          animate={{ rotate: [-10, 10, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
          className="w-11 h-11 rounded-[10px] bg-[#FEF2F2] flex items-center justify-center flex-shrink-0"
        >
          <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-0.5">
            <span
              className="text-[#DC2626] font-bold"
              style={{ fontSize: "14px", letterSpacing: "0.06em" }}
            >
              EMERGENCY REQUEST
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white"
              style={{ background: "#DC2626", fontSize: "11px", fontWeight: 600 }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              Active: {activeCount}
            </span>
          </div>
          <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
            Raise a critical blood request — it will instantly appear at the top of the priority queue
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="px-6 py-5 space-y-4">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Patient Name */}
          <div className="space-y-1.5">
            <label
              className="block text-[#374151] dark:text-gray-400"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}
            >
              PATIENT NAME
            </label>
            <input
              type="text"
              value={form.patientName}
              onChange={(e) => setField("patientName", e.target.value)}
              placeholder="e.g. Kavya Reddy"
              className={`w-full px-3 py-2 rounded-[8px] border bg-white dark:bg-[#0D1117] dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 focus:ring-[#DC2626]/25 focus:border-[#DC2626] ${
                errors.patientName
                  ? "border-[#DC2626]"
                  : "border-[#D1D5DB] dark:border-gray-600 hover:border-[#9CA3AF]"
              }`}
            />
            {errors.patientName && (
              <p className="text-[#DC2626]" style={{ fontSize: "11px" }}>
                {errors.patientName}
              </p>
            )}
          </div>

          {/* Blood Group */}
          <div className="space-y-1.5">
            <label
              className="block text-[#374151] dark:text-gray-400"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}
            >
              BLOOD GROUP
            </label>
            <select
              value={form.bloodGroup}
              onChange={(e) => setField("bloodGroup", e.target.value)}
              className={`w-full px-3 py-2 rounded-[8px] border bg-white dark:bg-[#0D1117] dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 focus:ring-[#DC2626]/25 focus:border-[#DC2626] ${
                errors.bloodGroup
                  ? "border-[#DC2626]"
                  : "border-[#D1D5DB] dark:border-gray-600 hover:border-[#9CA3AF]"
              }`}
            >
              <option value="">Select group</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.bloodGroup && (
              <p className="text-[#DC2626]" style={{ fontSize: "11px" }}>
                {errors.bloodGroup}
              </p>
            )}
          </div>

          {/* Units Required */}
          <div className="space-y-1.5">
            <label
              className="block text-[#374151] dark:text-gray-400"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}
            >
              UNITS REQUIRED
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.units}
              onChange={(e) => setField("units", e.target.value)}
              className={`w-full px-3 py-2 rounded-[8px] border bg-white dark:bg-[#0D1117] dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 focus:ring-[#DC2626]/25 focus:border-[#DC2626] ${
                errors.units
                  ? "border-[#DC2626]"
                  : "border-[#D1D5DB] dark:border-gray-600 hover:border-[#9CA3AF]"
              }`}
            />
            {errors.units && (
              <p className="text-[#DC2626]" style={{ fontSize: "11px" }}>
                {errors.units}
              </p>
            )}
          </div>

          {/* Hospital */}
          <div className="space-y-1.5">
            <label
              className="block text-[#374151] dark:text-gray-400"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}
            >
              HOSPITAL
            </label>
            <select
              value={form.hospitalId}
              onChange={(e) => setField("hospitalId", e.target.value)}
              className={`w-full px-3 py-2 rounded-[8px] border bg-white dark:bg-[#0D1117] dark:text-gray-100 text-sm outline-none transition-all focus:ring-2 focus:ring-[#DC2626]/25 focus:border-[#DC2626] ${
                errors.hospitalId
                  ? "border-[#DC2626]"
                  : "border-[#D1D5DB] dark:border-gray-600 hover:border-[#9CA3AF]"
              }`}
            >
              <option value="">Select hospital</option>
              {hospitals.map((h) => (
                <option key={h.hospital_id} value={h.hospital_id}>
                  {h.name}
                </option>
              ))}
            </select>
            {errors.hospitalId && (
              <p className="text-[#DC2626]" style={{ fontSize: "11px" }}>
                {errors.hospitalId}
              </p>
            )}
          </div>
        </div>

        {/* Urgency level + Submit button row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <label
              className="block text-[#374151] dark:text-gray-400"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}
            >
              URGENCY LEVEL
            </label>
            <div className="flex items-center gap-2">
              {(["Critical", "Urgent", "Standard"] as UrgencyLevel[]).map((level) => {
                const cfg = URGENCY_CONFIG[level];
                const active = urgency === level;
                return (
                  <button
                    key={level}
                    onClick={() => setUrgency(level)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-all"
                    style={{
                      fontSize: "13px",
                      background: active ? cfg.activeBg : cfg.inactiveBg,
                      color: active ? "#fff" : cfg.inactiveColor,
                      boxShadow: active ? `0 2px 10px ${cfg.shadow}` : "none",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: active ? "#fff" : cfg.inactiveColor }}
                    />
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[8px] bg-[#16A34A] text-white font-semibold"
                style={{ fontSize: "14px" }}
              >
                <Check className="w-4 h-4" />
                Emergency Raised!
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[8px] text-white font-semibold disabled:opacity-60 transition-opacity"
                style={{
                  fontSize: "14px",
                  background: "linear-gradient(135deg, #DC2626 0%, #9B1C1C 100%)",
                  boxShadow: "0 4px 14px rgba(220,38,38,0.45)",
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {loading ? "Raising..." : "Raise Emergency"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {errors.submit && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.submit}</p>
        )}
      </div>
    </motion.div>
  );
}
