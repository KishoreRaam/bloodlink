import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Phone, Lock, ArrowLeft } from "lucide-react";
import { donorLogin, setDonorPassword } from "../services/api";

export function DonorLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Set-password flow (for donors who registered before password was required)
  const [needsSetup, setNeedsSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupDone, setSetupDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await donorLogin(phone.trim(), password);
      localStorage.setItem("bl_donor_id", String(session.donor_id));
      navigate(`/donor/dashboard/${session.donor_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      if (msg.includes("No password set")) {
        setNeedsSetup(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await setDonorPassword(phone.trim(), newPassword);
      setSetupDone(true);
      setNeedsSetup(false);
      setPassword(newPassword);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex font-['Inter',sans-serif]">

      {/* ── Left Panel (dark) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] flex-col items-center justify-center relative overflow-hidden">

        {/* Ambient radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 40%, rgba(215,38,56,0.19) 0%, rgba(108,19,28,0.095) 35%, transparent 70%)"
          }}
        />

        {/* Floating blood drops (decorative) */}
        <span className="absolute left-[88px] top-[64px] text-5xl opacity-15 select-none">🩸</span>
        <span className="absolute left-[47px] top-[462px] text-3xl opacity-10 select-none">🩸</span>
        <span className="absolute right-[114px] top-[232px] text-6xl opacity-12 select-none">🩸</span>
        <span className="absolute right-[144px] bottom-[156px] text-2xl opacity-8 select-none">🩸</span>

        <div className="relative z-10 flex flex-col items-center text-center px-12 gap-8">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d72638] rounded-2xl shadow-[0px_8px_24px_rgba(215,38,56,0.38)] flex items-center justify-center">
              <svg viewBox="0 0 28 28" className="w-7 h-7 text-white fill-current">
                <path d="M14 2C9.8 2 7 8.2 7 12c0 6.2 7 14 7 14s7-7.8 7-14c0-3.8-2.8-10-7-10zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
              </svg>
            </div>
            <span className="text-white font-extrabold text-[26px]">BloodLink</span>
          </div>

          {/* Glowing blood drop icon */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer orbit ring */}
            <div
              className="absolute inset-[-67px] rounded-full border border-[rgba(215,38,56,0.25)]"
              style={{ transform: "rotate(63deg)" }}
            />
            {/* Inner orbit ring */}
            <div
              className="absolute inset-[-74px] rounded-full border border-[rgba(215,38,56,0.13)]"
              style={{ borderWidth: "0.8px", transform: "rotate(-42deg)" }}
            />
            {/* Glow circle */}
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center shadow-[0px_0px_80px_rgba(215,38,56,0.38),0px_0px_40px_rgba(215,38,56,0.19)]"
              style={{
                background: "radial-gradient(ellipse at 35% 35%, rgba(215,38,56,0.8) 0%, rgba(215,38,56,0.4) 100%)"
              }}
            >
              {/* Blood drop SVG */}
              <svg viewBox="0 0 80 80" className="w-20 h-20 text-white fill-current">
                <path d="M40 8C28 8 16 28 16 40c0 13.3 10.7 24 24 24s24-10.7 24-24C64 28 52 8 40 8zm0 34a10 10 0 110-20 10 10 0 010 20z"/>
              </svg>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-white font-extrabold text-[32px] leading-tight">
              Welcome back, hero.
            </h1>
            <p className="text-[#9ca3af] text-[16px] leading-[1.6] max-w-[306px]">
              Every donation you make connects a life to hope. Log in to check your status.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2">
            {[
              { value: "500+", label: "Donors" },
              { value: "3",    label: "Cities" },
              { value: "50+",  label: "Lives Saved" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-[#d72638] font-extrabold text-[20px] leading-none">{stat.value}</span>
                <span className="text-[#6b7280] text-[11px]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (white) ── */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col relative">

        {/* Back to Home */}
        <div className="p-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#9ca3af] hover:text-[#374151] text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-[400px]">

            {/* Title */}
            <h2 className="text-[#1a1a2e] font-extrabold text-[28px] leading-tight mb-2">
              Login as Donor
            </h2>
            <p className="text-[#9ca3af] text-[14px] mb-8">
              Enter your registered contact number
            </p>

            {/* ── Set-password panel ── */}
            {needsSetup && (
              <form onSubmit={handleSetPassword} className="space-y-4 mb-6 p-5 border border-[#fed7aa] bg-[#fff7ed] rounded-[12px]">
                <div>
                  <p className="text-[#92400e] font-bold text-[14px]">First-time setup required</p>
                  <p className="text-[#92400e] text-[13px] mt-0.5">
                    Your account has no password yet. Set one now to continue.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#374151] text-[13px] font-semibold">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 py-3 border border-[#e5e7eb] rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#374151] text-[13px] font-semibold">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 py-3 border border-[#e5e7eb] rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20"
                    />
                  </div>
                </div>
                {error && <p className="text-red-600 text-[13px]">{error}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-[#d72638] rounded-[10px] text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-60">
                    {loading ? "Saving…" : "Set Password →"}
                  </button>
                  <button type="button" onClick={() => { setNeedsSetup(false); setError(""); }}
                    className="px-4 py-3 border border-[#e5e7eb] rounded-[10px] text-[#6b7280] text-[14px] hover:bg-[#f9fafb]">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* ── Password-set success banner ── */}
            {setupDone && (
              <div className="mb-4 p-4 border border-green-200 bg-green-50 rounded-[10px]">
                <p className="text-green-800 font-semibold text-[13px]">✓ Password set! Now log in below.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-[#e5e7eb]">
                    <Phone className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280] text-[13px] font-semibold">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-[80px] pr-4 py-3.5 border border-[#e5e7eb] rounded-[10px] text-[14px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.3)] bg-white focus:outline-none focus:border-[#d72638] focus:ring-2 focus:ring-[#d72638]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[#374151] text-[13px] font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#d72638] rounded-[10px] text-white font-bold text-[15px] shadow-[0px_6px_20px_rgba(215,38,56,0.25)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Logging in…" : "Login →"}
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#e5e7eb]" />
                <span className="text-[#9ca3af] text-[12px]">OR</span>
                <div className="flex-1 h-px bg-[#e5e7eb]" />
              </div>

              {/* Register button */}
              <button
                type="button"
                onClick={() => navigate("/donor/register")}
                className="w-full py-3.5 border-2 border-[#d72638] rounded-[10px] text-[#d72638] font-semibold text-[15px] hover:bg-[#FDECEE] transition-all"
              >
                Register as New Donor →
              </button>
            </form>

            {/* Admin portal link */}
            <p className="text-center text-[13px] text-[#9ca3af] mt-6">
              Hospital staff?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#d72638] font-semibold text-[16px] hover:underline"
              >
                Admin Portal →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
