import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Phone, Eye, EyeOff, Lock } from "lucide-react";
import { createDonor } from "../services/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
type BloodGroup = (typeof BLOOD_GROUPS)[number];
type Gender = "Male" | "Female" | "Other";

// Colours for the decorative blood-group tiles on the left panel
const TILE_COLORS: Record<BloodGroup, string> = {
  "A+":  "#1e3052",
  "A-":  "#223460",
  "B+":  "#2a1e52",
  "B-":  "#2e2060",
  "O+":  "#1a3a2a",
  "O-":  "#1e3d2e",
  "AB+": "#3a2a10",
  "AB-": "#3d2c10",
};

export function DonorRegister() {
  const navigate = useNavigate();

  const [name, setName]               = useState("");
  const [age, setAge]                 = useState("");
  const [gender, setGender]           = useState<Gender>("Male");
  const [bloodGroup, setBloodGroup]   = useState<BloodGroup | "">("");
  const [phone, setPhone]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress]         = useState("");
  const [available, setAvailable]     = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bloodGroup) { setError("Please select a blood group."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const created = await createDonor({
        name: name.trim(),
        age: Number(age),
        gender,
        blood_group: bloodGroup,
        contact_number: phone.trim(),
        address: address.trim() || undefined,
        availability_status: available ? "Available" : "Not Available",
        password,
      });
      localStorage.setItem("bl_donor_id", String(created.donor_id));
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-['Inter',sans-serif] px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#d72638] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0px_8px_32px_rgba(215,38,56,0.3)]">
            <svg viewBox="0 0 40 40" className="w-10 h-10 text-white fill-current">
              <path d="M20 4C11.2 4 4 11.2 4 20s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4zm-2 24l-8-8 2.8-2.8L18 22.4l9.2-9.2L30 16l-12 12z"/>
            </svg>
          </div>
          <h2 className="text-[#1a1a2e] font-extrabold text-[28px] mb-2">You're registered!</h2>
          <p className="text-[#6b7280] text-[15px] leading-[1.7] mb-8">
            Welcome to the BloodLink network. Your profile is now visible to hospitals in need.
          </p>
          <button
            onClick={() => navigate("/donor/dashboard")}
            className="w-full py-3.5 bg-[#d72638] rounded-[10px] text-white font-bold text-[15px] shadow-[0px_6px_20px_rgba(215,38,56,0.25)] hover:opacity-90 transition-all"
          >
            Go to Dashboard →
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-3 w-full py-3.5 border border-[#e5e7eb] rounded-[10px] text-[#6b7280] text-[14px] hover:bg-[#f9fafb] transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-['Inter',sans-serif]">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] flex-col items-center justify-center relative overflow-hidden">

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(215,38,56,0.19) 0%, rgba(108,19,28,0.1) 35%, transparent 70%)" }}
        />

        {/* Floating decorative drops */}
        <span className="absolute left-[88px] top-[64px] text-4xl opacity-15 select-none">🩸</span>
        <span className="absolute right-[114px] top-[240px] text-5xl opacity-12 select-none">🩸</span>
        <span className="absolute left-[46px] bottom-[180px] text-3xl opacity-10 select-none">🩸</span>
        <span className="absolute right-[140px] bottom-[120px] text-2xl opacity-8 select-none">🩸</span>

        <div className="relative z-10 flex flex-col items-center text-center px-12 gap-8">

          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d72638] rounded-2xl shadow-[0px_8px_24px_rgba(215,38,56,0.38)] flex items-center justify-center">
              <svg viewBox="0 0 28 28" className="w-7 h-7 text-white fill-current">
                <path d="M14 2C9.8 2 7 8.2 7 12c0 6.2 7 14 7 14s7-7.8 7-14c0-3.8-2.8-10-7-10zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
              </svg>
            </div>
            <span className="text-white font-extrabold text-[26px]">BloodLink</span>
          </button>

          {/* Blood-group tile grid */}
          <div className="grid grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((g) => (
              <div
                key={g}
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                style={{ background: TILE_COLORS[g] }}
              >
                <span className="text-white font-extrabold text-[15px] font-mono">{g}</span>
              </div>
            ))}
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-white font-extrabold text-[30px] leading-tight">
              Join the BloodLink Network.
            </h1>
            <p className="text-[#9ca3af] text-[15px] leading-[1.7] max-w-[320px]">
              Takes less than 2 minutes. Your profile will be immediately visible to hospitals in need.
            </p>
          </div>

          {/* Achievement badges */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {[
              { icon: "🩸", label: "First Drop" },
              { icon: "🔥", label: "3x Donor" },
              { icon: "⭐", label: "Life Saver" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.1)]"
              >
                <span className="text-sm">{badge.icon}</span>
                <span className="text-[#9ca3af] text-[12px] font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col overflow-y-auto">

        {/* Back link */}
        <div className="p-6 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#9ca3af] hover:text-[#374151] text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 px-8 pb-12">
          <div className="w-full max-w-[400px]">

            <h2 className="text-[#1a1a2e] font-extrabold text-[28px] leading-tight mb-1">
              Register as Donor
            </h2>
            <p className="text-[#9ca3af] text-[14px] mb-8">
              Help save lives — takes less than 2 minutes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Full Name <span className="text-[#d72638]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full px-4 py-3.5 border border-[#e5e7eb] rounded-[10px] text-[14px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.3)] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20 transition-all"
                />
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[#374151] text-[13px] font-semibold">
                    Age <span className="text-[#d72638]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-4 py-3.5 border border-[#e5e7eb] rounded-[10px] text-[14px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.3)] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#374151] text-[13px] font-semibold">Gender</label>
                  <div className="flex border border-[#e5e7eb] rounded-[10px] overflow-hidden h-[50px]">
                    {(["Male", "Female", "Other"] as Gender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className="flex-1 text-[13px] font-semibold transition-all"
                        style={{
                          background: gender === g ? "#d72638" : "transparent",
                          color: gender === g ? "#fff" : "#6b7280",
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Blood Group <span className="text-[#d72638]">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setBloodGroup(g)}
                      className="h-[52px] rounded-[10px] border text-[14px] font-bold font-mono transition-all"
                      style={{
                        borderColor: bloodGroup === g ? "#d72638" : "#e5e7eb",
                        background: bloodGroup === g ? "#d72638" : "#fff",
                        color: bloodGroup === g ? "#fff" : "#1a1a2e",
                        boxShadow: bloodGroup === g ? "0 4px 14px rgba(215,38,56,0.25)" : "none",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Phone Number <span className="text-[#d72638]">*</span>
                </label>
                <div className="flex border border-[#e5e7eb] rounded-[10px] overflow-hidden focus-within:border-[#d72638] focus-within:ring-2 focus-within:ring-[#d72638]/20 transition-all">
                  <div className="flex items-center gap-2 px-4 bg-white border-r border-[#e5e7eb] flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280] text-[13px] font-semibold whitespace-nowrap">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-4 py-3.5 text-[14px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.3)] bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Password <span className="text-[#d72638]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-12 py-3.5 border border-[#e5e7eb] rounded-[10px] text-[14px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.3)] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[#9ca3af] text-[11px]">You'll use this to log in later.</p>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Address <span className="text-[#d72638]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full px-4 py-3.5 border border-[#e5e7eb] rounded-[10px] text-[14px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.3)] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20 transition-all resize-none"
                />
              </div>

              {/* Availability toggle */}
              <div className="border border-[#e5e7eb] rounded-[10px] px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[#1a1a2e] text-[14px] font-semibold">Available to donate</p>
                  <p className="text-[13px] mt-0.5">
                    Status:{" "}
                    <span className={`font-semibold ${available ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                      {available ? "● Available" : "● Not Available"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${available ? "bg-[#16a34a]" : "bg-[#e5e7eb]"}`}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: available ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#d72638] rounded-[10px] text-white font-bold text-[15px] shadow-[0px_6px_20px_rgba(215,38,56,0.25)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Registering…" : "Register Now →"}
              </button>
            </form>

            {/* Already registered */}
            <p className="text-center text-[13px] text-[#9ca3af] mt-5">
              Already registered?{" "}
              <button
                onClick={() => navigate("/donor")}
                className="text-[#d72638] font-bold text-[15px] hover:underline"
              >
                Login →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
