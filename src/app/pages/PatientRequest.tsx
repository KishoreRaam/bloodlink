import { useState } from "react";
import { AlertCircle, Minus, Plus, CheckCircle, X, Loader2, Droplets, Users } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const bloodGroupColors: Record<string, string> = {
  "A+": "#2563EB", "A-": "#1D4ED8",
  "B+": "#7C3AED", "B-": "#5B21B6",
  "AB+": "#D97706", "AB-": "#B45309",
  "O+": "#C0152A", "O-": "#991B1B",
};

const HOSPITALS = [
  "Apollo Hospital, Chennai", "AIIMS Delhi", "Fortis Health, Chennai",
  "Manipal Hospital, Bangalore", "LifeCare Hospital", "Max Hospital, Delhi",
];

const MATCHING_DONORS: Record<string, { name: string; initials: string; city: string; color: string }[]> = {
  "O+": [
    { name: "Rahul Kumar", initials: "RK", city: "Chennai", color: "#C0152A" },
    { name: "Mohan Lal", initials: "ML", city: "Chennai", color: "#D97706" },
    { name: "Priya Singh", initials: "PS", city: "Chennai", color: "#7C3AED" },
  ],
  "O-": [
    { name: "Ananya Iyer", initials: "AI", city: "Chennai", color: "#16A34A" },
  ],
  "A+": [
    { name: "Priya Sharma", initials: "PS", city: "Chennai", color: "#2563EB" },
    { name: "Sanjay Gupta", initials: "SG", city: "Chennai", color: "#C0152A" },
  ],
  "A-": [
    { name: "Arjun Mehta", initials: "AM", city: "Chennai", color: "#2563EB" },
  ],
  "B+": [
    { name: "Divya Patel", initials: "DP", city: "Chennai", color: "#16A34A" },
    { name: "Karthik Raja", initials: "KR", city: "Chennai", color: "#D97706" },
    { name: "Nisha Das", initials: "ND", city: "Chennai", color: "#C0152A" },
    { name: "Ravi Verma", initials: "RV", city: "Chennai", color: "#7C3AED" },
  ],
  "B-": [
    { name: "Vikram Singh", initials: "VS", city: "Chennai", color: "#0891B2" },
  ],
  "AB+": [
    { name: "Kavya Reddy", initials: "KR", city: "Chennai", color: "#C0152A" },
    { name: "Meena Devi", initials: "MD", city: "Chennai", color: "#7C3AED" },
  ],
  "AB-": [],
};

export function PatientRequest() {
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState("");
  const [requestDate] = useState(new Date().toISOString().split("T")[0]);
  const [urgency, setUrgency] = useState<"Normal" | "Urgent">("Normal");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requestId] = useState("#REQ-2026-" + String(Math.floor(Math.random() * 1000)).padStart(4, "0"));

  const matches = bloodGroup ? (MATCHING_DONORS[bloodGroup] || []) : [];
  const availableMatches = matches.slice(0, 2);
  const extraCount = Math.max(0, matches.length - 2);

  const handleSubmit = () => {
    if (!patientName || !bloodGroup || !hospital) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setShowModal(true);
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-5 h-5" style={{ color: "#C0152A" }} />
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Emergency Blood Request
          </h1>
        </div>
        <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "14px" }}>
          Fill this form to find matching donors instantly
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Request Form */}
        <div className="xl:col-span-7">
          <div
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "16px", fontWeight: 600 }}>
                Patient Details
              </h2>
              <div className="space-y-5">
                {/* Patient Name */}
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Patient Name <span className="text-[#C0152A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full name of patient"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none placeholder-[#9CA3AF] dark:placeholder-gray-600"
                    style={{ fontSize: "14px" }}
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-3" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Blood Group <span className="text-[#C0152A]">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((group) => (
                      <button
                        key={group}
                        onClick={() => setBloodGroup(group)}
                        className={`h-12 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${
                          bloodGroup === group 
                            ? "text-white" 
                            : "text-[#374151] dark:text-gray-300 border-[#E5E7EB] dark:border-gray-600"
                        }`}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "14px",
                          fontWeight: 600,
                          ...(bloodGroup === group ? {
                            borderColor: bloodGroupColors[group],
                            background: bloodGroupColors[group],
                            boxShadow: `0 4px 14px ${bloodGroupColors[group]}40`
                          } : {
                            background: "transparent",
                            boxShadow: "none"
                          })
                        }}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Units Required */}
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Units Required
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUnits((u) => Math.max(1, u - 1))}
                      className="w-10 h-10 rounded-lg border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-[#6B7280] dark:text-gray-400 hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      className="w-12 text-center text-[#111827] dark:text-white"
                      style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {units}
                    </span>
                    <button
                      onClick={() => setUnits((u) => Math.min(10, u + 1))}
                      className="w-10 h-10 rounded-lg border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-[#6B7280] dark:text-gray-400 hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                      unit{units > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Hospital */}
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Hospital <span className="text-[#C0152A]">*</span>
                  </label>
                  <select
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none"
                    style={{ fontSize: "14px" }}
                  >
                    <option value="">Select a hospital...</option>
                    {HOSPITALS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Date + Urgency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      Request Date
                    </label>
                    <input
                      type="date"
                      defaultValue={requestDate}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none"
                      style={{ fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      Urgency Level
                    </label>
                    <div className="flex gap-3">
                      {(["Normal", "Urgent"] as const).map((level) => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={urgency === level}
                            onChange={() => setUrgency(level)}
                            className="accent-[#C0152A]"
                          />
                          <span style={{ fontSize: "13px", fontWeight: 500, color: level === "Urgent" && urgency === "Urgent" ? "#D97706" : "#374151" }}>
                            {level}
                          </span>
                        </label>
                      ))}
                    </div>
                    {urgency === "Urgent" && (
                      <div className="flex items-center gap-1.5 mt-2 p-2 rounded-lg" style={{ background: "#FFFBEB" }}>
                        <AlertCircle className="w-3.5 h-3.5" style={{ color: "#D97706" }} />
                        <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 500 }}>
                          Priority matching will be applied
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-5">
              <button
                onClick={handleSubmit}
                disabled={loading || !patientName || !bloodGroup || !hospital}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#C0152A", fontSize: "15px", fontWeight: 700 }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Finding Donors...</>
                ) : (
                  <><Droplets className="w-4 h-4" /> Find Matching Donors</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Match Preview */}
        <div className="xl:col-span-5">
          <div
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6 sticky top-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: "#C0152A" }} />
              <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                {bloodGroup ? `Matching Donors for ${bloodGroup}` : "Live Match Preview"}
              </h2>
              {bloodGroup && (
                <BloodGroupBadge group={bloodGroup} size="sm" />
              )}
            </div>

            {!bloodGroup ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "#F3F4F6" }}
                >
                  <Droplets className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                  Select a blood group to see matching donors
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "#FDECEE" }}
                >
                  <AlertCircle className="w-8 h-8" style={{ color: "#C0152A" }} />
                </div>
                <p className="text-[#C0152A]" style={{ fontSize: "14px", fontWeight: 600 }}>
                  No donors available
                </p>
                <p className="text-[#6B7280] dark:text-gray-400 mt-1" style={{ fontSize: "12px" }}>
                  No {bloodGroup} donors currently available in your area
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableMatches.map((donor) => (
                  <div
                    key={donor.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] dark:bg-[#0D1117] border border-[#F3F4F6] dark:border-gray-700/30"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: donor.color, fontSize: "12px", fontWeight: 700 }}
                    >
                      {donor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#111827] dark:text-gray-100 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {donor.name}
                      </p>
                      <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                        📍 {donor.city}
                      </p>
                    </div>
                    <BloodGroupBadge group={bloodGroup} size="sm" />
                    <StatusBadge status="Available" compact />
                  </div>
                ))}
                {extraCount > 0 && (
                  <div className="border-t border-[#E5E7EB] dark:border-gray-700/50 pt-3">
                    <p className="text-[#C0152A] dark:text-[#ff6b7a] text-center" style={{ fontSize: "13px", fontWeight: 600 }}>
                      + {extraCount} more available donor{extraCount > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <div className="pt-2 p-3 rounded-xl border border-[#16A34A]/20" style={{ background: "#F0FDF4" }}>
                  <p className="text-[#16A34A]" style={{ fontSize: "12px", fontWeight: 500 }}>
                    ✅ {matches.length} donor{matches.length > 1 ? "s" : ""} match your blood group request
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative bg-white dark:bg-[#1A1F2E] rounded-[16px] p-8 w-full max-w-md shadow-2xl text-center"
            style={{ animation: "bounceIn 0.4s ease" }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#F0FDF4" }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: "#16A34A" }} />
            </div>

            <h3 className="text-[#111827] dark:text-white mb-2" style={{ fontSize: "20px", fontWeight: 700 }}>
              Request Submitted!
            </h3>
            <p
              className="text-[#6B7280] dark:text-gray-400 mb-1"
              style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Request ID: {requestId}
            </p>
            <p className="text-[#6B7280] dark:text-gray-400 mb-6" style={{ fontSize: "14px" }}>
              {matches.length} donor{matches.length !== 1 ? "s" : ""} matched for{" "}
              <strong>{bloodGroup}</strong>.{" "}
              We'll notify the hospital within 15 minutes.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                View All Requests
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setPatientName("");
                  setBloodGroup(null);
                  setUnits(1);
                  setHospital("");
                  setUrgency("Normal");
                  setSubmitted(false);
                }}
                className="flex-1 py-2.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{ background: "#C0152A", fontSize: "13px", fontWeight: 600 }}
              >
                New Request
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
