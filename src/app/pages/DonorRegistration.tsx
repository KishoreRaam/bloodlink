import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, User, Droplets, Phone, AlertCircle, Loader2 } from "lucide-react";
import { createDonor } from "../services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const bloodGroupColors: Record<string, string> = {
  "A+": "#2563EB", "A-": "#1D4ED8",
  "B+": "#7C3AED", "B-": "#5B21B6",
  "AB+": "#D97706", "AB-": "#B45309",
  "O+": "#C0152A", "O-": "#991B1B",
};

export function DonorRegistration() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [availability, setAvailability] = useState(true);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "", age: "", phone: "", address: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 65)
      newErrors.age = "Age must be between 18 and 65";
    if (!selectedGroup) newErrors.blood = "Please select a blood group";
    if (!form.phone.trim() || form.phone.length < 10)
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) newErrors.address = "Address is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await createDonor({
        name: form.name,
        age: Number(form.age),
        gender,
        blood_group: selectedGroup!,
        contact_number: form.phone,
        address: form.address,
        availability_status: availability ? "Available" : "Not Available",
      });
      setSuccess(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccess(false);
        setForm({ name: "", age: "", phone: "", address: "" });
        setSelectedGroup(null);
        setAvailability(true);
        setGender("Male");
      }, 2500);
    } catch (err: any) {
      const msg = err.message ?? "Registration failed";
      if (msg.toLowerCase().includes("contact number")) {
        setErrors((e) => ({ ...e, phone: msg }));
      } else {
        setErrors((e) => ({ ...e, phone: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F3F4F6] dark:bg-[#0D1117] py-8 px-4 sm:px-6">
      {/* Success Banner */}
      {showSuccess && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4"
          style={{ background: "#16A34A", color: "white", animation: "slideDown 0.3s ease" }}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            ✅ Donor {form.name || "Rahul Kumar"} ({selectedGroup}) registered successfully!
          </span>
        </div>
      )}

      <div className="max-w-[640px] mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#6B7280] dark:text-gray-400 hover:text-[#C0152A] dark:hover:text-[#ff6b7a] mb-6 transition-colors"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FDECEE" }}>
              <Droplets className="w-5 h-5" style={{ color: "#C0152A" }} />
            </div>
            <div>
              <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>
                Register New Donor
              </h1>
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                Add a blood donor to the system
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          {/* Section: Personal Information */}
          <div className="px-6 py-5 border-b border-[#F3F4F6] dark:border-gray-700/50">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-[#C0152A]" />
              <h3 className="text-[#111827] dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                Personal Information
              </h3>
            </div>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Full Name <span className="text-[#C0152A]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className={`w-full px-4 py-2.5 rounded-lg bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 outline-none transition-all placeholder-[#9CA3AF] dark:placeholder-gray-600 ${
                    errors.name
                      ? "border-[#C0152A] ring-2 ring-[#C0152A]/20"
                      : "border-[#E5E7EB] dark:border-gray-600 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20"
                  } border`}
                  style={{ fontSize: "14px" }}
                />
                {errors.name && (
                  <p className="flex items-center gap-1 mt-1.5 text-[#C0152A]" style={{ fontSize: "12px" }}>
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Age <span className="text-[#C0152A]">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="e.g. 25"
                    min={18}
                    max={65}
                    className={`w-full px-4 py-2.5 rounded-lg bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 outline-none transition-all placeholder-[#9CA3AF] dark:placeholder-gray-600 border ${
                      errors.age
                        ? "border-[#C0152A] ring-2 ring-[#C0152A]/20"
                        : "border-[#E5E7EB] dark:border-gray-600 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20"
                    }`}
                    style={{ fontSize: "14px" }}
                  />
                  {errors.age && (
                    <p className="flex items-center gap-1 mt-1.5 text-[#C0152A]" style={{ fontSize: "12px" }}>
                      <AlertCircle className="w-3 h-3" /> {errors.age}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Gender
                  </label>
                  <div className="flex rounded-lg border border-[#E5E7EB] dark:border-gray-600 overflow-hidden">
                    {(["Male", "Female", "Other"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className="flex-1 py-2.5 text-center transition-all"
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          background: gender === g ? "#C0152A" : "transparent",
                          color: gender === g ? "#fff" : "#6B7280",
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Blood & Medical */}
          <div className="px-6 py-5 border-b border-[#F3F4F6] dark:border-gray-700/50">
            <div className="flex items-center gap-2 mb-5">
              <Droplets className="w-4 h-4 text-[#C0152A]" />
              <h3 className="text-[#111827] dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                Blood & Medical
              </h3>
            </div>
            <div className="space-y-5">
              {/* Blood Group Selector */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-3" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Blood Group <span className="text-[#C0152A]">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => {
                        setSelectedGroup(group);
                        if (errors.blood) setErrors((e) => ({ ...e, blood: "" }));
                      }}
                      className="h-12 rounded-lg border-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "14px",
                        fontWeight: 600,
                        borderColor: selectedGroup === group ? bloodGroupColors[group] : "#E5E7EB",
                        background: selectedGroup === group ? bloodGroupColors[group] : "transparent",
                        color: selectedGroup === group ? "#fff" : "#374151",
                        boxShadow: selectedGroup === group ? `0 4px 14px ${bloodGroupColors[group]}40` : "none",
                      }}
                    >
                      {group}
                    </button>
                  ))}
                </div>
                {errors.blood && (
                  <p className="flex items-center gap-1 mt-2 text-[#C0152A]" style={{ fontSize: "12px" }}>
                    <AlertCircle className="w-3 h-3" /> {errors.blood}
                  </p>
                )}
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-[#374151] dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Availability Status
                  </p>
                  <p className="text-[#6B7280] dark:text-gray-500 mt-0.5" style={{ fontSize: "12px" }}>
                    Is this donor currently available to donate?
                  </p>
                </div>
                <button
                  onClick={() => setAvailability(!availability)}
                  className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                  style={{ background: availability ? "#C0152A" : "#D1D5DB" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: availability ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
              </div>
              <p className="text-[#6B7280] dark:text-gray-500 -mt-2" style={{ fontSize: "12px" }}>
                Status: <span style={{ color: availability ? "#16A34A" : "#6B7280", fontWeight: 500 }}>
                  {availability ? "● Available" : "● Not Available"}
                </span>
              </p>
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-5">
              <Phone className="w-4 h-4 text-[#C0152A]" />
              <h3 className="text-[#111827] dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                Contact Details
              </h3>
            </div>
            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Contact Number <span className="text-[#C0152A]">*</span>
                </label>
                <div className="flex">
                  <span
                    className="flex items-center px-3 bg-[#F3F4F6] dark:bg-[#0D1117] border border-r-0 border-[#E5E7EB] dark:border-gray-600 rounded-l-lg text-[#6B7280] dark:text-gray-400"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className={`flex-1 px-4 py-2.5 rounded-r-lg bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 outline-none transition-all placeholder-[#9CA3AF] dark:placeholder-gray-600 border ${
                      errors.phone
                        ? "border-[#C0152A] ring-2 ring-[#C0152A]/20"
                        : "border-[#E5E7EB] dark:border-gray-600 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20"
                    }`}
                    style={{ fontSize: "14px" }}
                  />
                </div>
                {errors.phone && (
                  <p className="flex items-center gap-1 mt-1.5 text-[#C0152A]" style={{ fontSize: "12px" }}>
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Address <span className="text-[#C0152A]">*</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Street, City, State"
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-lg bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 outline-none transition-all placeholder-[#9CA3AF] dark:placeholder-gray-600 resize-none border ${
                    errors.address
                      ? "border-[#C0152A] ring-2 ring-[#C0152A]/20"
                      : "border-[#E5E7EB] dark:border-gray-600 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20"
                  }`}
                  style={{ fontSize: "14px" }}
                />
                {errors.address && (
                  <p className="flex items-center gap-1 mt-1.5 text-[#C0152A]" style={{ fontSize: "12px" }}>
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="px-6 pb-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "#C0152A", fontSize: "15px", fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4" />
                  Register Donor
                </>
              )}
            </button>
            <p className="text-center mt-3 text-[#6B7280] dark:text-gray-500" style={{ fontSize: "13px" }}>
              Already registered?{" "}
              <button
                onClick={() => navigate("/search")}
                className="text-[#C0152A] dark:text-[#ff6b7a] hover:underline"
                style={{ fontWeight: 500 }}
              >
                Search donors →
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
