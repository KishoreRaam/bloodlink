import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Calendar, Share2, Edit3, Eye, EyeOff, MessageCircle, Clock, Lock, Droplets } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { getDonor, getDonorHistory, updateDonor, type Donor, type DonationHistory } from "../services/api";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const BADGES = [
  { icon: "🏅", label: "First Drop",  desc: "First donation",        minDonations: 1, color: "#D97706", glow: "#F59E0B" },
  { icon: "🔥", label: "3x Donor",    desc: "3 donations",           minDonations: 3, color: "#C0152A", glow: "#EF4444" },
  { icon: "⭐", label: "Life Saver",  desc: "5 donations",           minDonations: 5, color: "#7C3AED", glow: "#8B5CF6" },
  { icon: "💎", label: "Iron Donor",  desc: "10 donations",          minDonations: 10, color: "#0891B2", glow: "#06B6D4" },
];

export function DonorProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", age: "", address: "", email: "", contact_number: "", availability_status: "Available" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    Promise.all([getDonor(Number(id)), getDonorHistory(Number(id))])
      .then(([d, h]) => {
        setDonor(d);
        setHistory(h);
        setEditForm({
          name: d.name, age: String(d.age),
          address: d.address ?? "", email: d.email ?? "",
          contact_number: d.contact_number,
          availability_status: d.availability_status,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditSave = async () => {
    if (!donor) return;
    setEditLoading(true);
    setEditError("");
    try {
      const updated = await updateDonor(donor.donor_id, {
        name: editForm.name,
        age: Number(editForm.age),
        address: editForm.address || undefined,
        email: editForm.email || undefined,
        contact_number: editForm.contact_number,
        availability_status: editForm.availability_status,
      });
      setDonor(updated);
      setShowEdit(false);
    } catch (err: any) {
      setEditError(err.message ?? "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Droplets className="w-8 h-8 animate-pulse" style={{ color: "#C0152A" }} />
      </div>
    );
  }

  if (notFound || !donor) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4">
        <p className="text-[#111827] dark:text-white text-lg font-semibold">Donor not found</p>
        <button onClick={() => navigate("/")} className="text-[#C0152A] hover:underline text-sm">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // Eligibility calculation
  const today = new Date();
  const lastDonated = donor.last_donated ? new Date(donor.last_donated) : null;
  const daysSince = lastDonated
    ? Math.floor((today.getTime() - lastDonated.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const daysRemaining = daysSince !== null ? Math.max(0, 90 - daysSince) : 0;
  const progressPct = daysSince !== null ? Math.min(100, Math.round((daysSince / 90) * 100)) : 100;
  const isEligible = daysRemaining === 0;

  const nextEligibleDate = lastDonated
    ? new Date(lastDonated.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Now";

  const totalUnits = history.reduce((sum, h) => sum + h.quantity_donated, 0);
  const memberSince = new Date(donor.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="min-h-full bg-[#F3F4F6] dark:bg-[#0D1117]">
      {/* Back */}
      <div className="px-6 lg:px-8 pt-6 max-w-[1280px] mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#6B7280] dark:text-gray-400 hover:text-[#C0152A] dark:hover:text-[#ff6b7a] mb-5 transition-colors"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Hero */}
      <div className="w-full mb-8" style={{ background: "linear-gradient(135deg, #C0152A 0%, #7B0A18 100%)" }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/30"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
            >
              <span style={{ color: "#fff", fontSize: "26px", fontWeight: 700 }}>{initials(donor.name)}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 700 }}>{donor.name}</h1>
                <BloodGroupBadge group={donor.blood_group} inverted size="md" />
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {donor.address && (
                  <span className="flex items-center gap-1.5 text-white/80" style={{ fontSize: "13px" }}>
                    <MapPin className="w-3.5 h-3.5" /> {donor.address.split(",").slice(-1)[0].trim()}
                  </span>
                )}
                <span className="text-white/60">•</span>
                <span className="text-white/80" style={{ fontSize: "13px" }}>Age {donor.age}</span>
                <span className="text-white/60">•</span>
                <span className="flex items-center gap-1.5 text-white/80" style={{ fontSize: "13px" }}>
                  <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
                </span>
              </div>
              <StatusBadge status={donor.availability_status as any} compact />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all"
                style={{ fontSize: "13px", fontWeight: 500, backdropFilter: "blur(4px)" }}
                onClick={() => setShowEdit(true)}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all"
                style={{ fontSize: "13px", fontWeight: 500, backdropFilter: "blur(4px)" }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left */}
          <div className="xl:col-span-7 space-y-5">
            {/* Eligibility */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              {isEligible ? (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#F0FDF4" }}>
                  <span className="text-2xl">✅</span>
                  <div>
                    <p style={{ color: "#16A34A", fontSize: "14px", fontWeight: 600 }}>
                      {lastDonated ? "Eligible to donate today!" : "Never donated — eligible now!"}
                    </p>
                    <p style={{ color: "#15803D", fontSize: "12px" }}>
                      {lastDonated ? `It's been ${daysSince} days since last donation.` : "Ready for first donation."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4" style={{ color: "#C0152A" }} />
                    <h3 className="text-[#111827] dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                      Next Eligible to Donate
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[#111827] dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                      {nextEligibleDate}
                    </span>
                    <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                      ({daysRemaining} days remaining)
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-2.5 bg-[#F3F4F6] dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "#C0152A" }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>
                        Last donated: {lastDonated ? formatDate(donor.last_donated!) : "—"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>{progressPct}% of cooldown elapsed</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Donation History */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Droplets className="w-4 h-4" style={{ color: "#C0152A" }} />
                <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  Donation History
                </h2>
                <span className="ml-auto px-2.5 py-0.5 rounded-full text-white" style={{ background: "#C0152A", fontSize: "11px", fontWeight: 600 }}>
                  {history.length} donation{history.length !== 1 ? "s" : ""}
                </span>
              </div>

              {history.length === 0 ? (
                <p className="text-center text-[#6B7280] dark:text-gray-400 py-8" style={{ fontSize: "13px" }}>
                  No donations recorded yet
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((d, i) => (
                    <div key={d.donation_id} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white dark:border-[#1A1F2E] mt-1"
                          style={{ background: "#C0152A", boxShadow: "0 0 0 2px #C0152A33" }}
                        />
                        {i < history.length - 1 && (
                          <div className="w-0.5 flex-1 mt-1" style={{ background: "#E5E7EB", minHeight: "32px" }} />
                        )}
                      </div>
                      <div className="flex-1 mb-3 p-4 rounded-xl border border-[#F3F4F6] dark:border-gray-700/30 hover:border-[#FDECEE] dark:hover:border-[#C0152A]/20 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "14px", fontWeight: 600 }}>
                              {d.blood_bank_name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                              <MapPin className="w-3 h-3" />
                              <span>{d.blood_bank_city}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                              {formatDate(d.donation_date)}
                            </p>
                            <p className="mt-0.5" style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#C0152A", fontWeight: 600 }}>
                              {d.quantity_donated} unit donated
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="xl:col-span-5 space-y-5">
            {/* Stats */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <h3 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "14px", fontWeight: 600 }}>
                Donation Stats
              </h3>
              <div className="divide-y divide-[#F3F4F6] dark:divide-gray-700/40">
                {[
                  { label: "Total Donations", value: String(history.length), icon: "🩸" },
                  { label: "Blood Donated",   value: `${totalUnits} unit${totalUnits !== 1 ? "s" : ""}`, icon: "💉" },
                  { label: "Lives Impacted",  value: String(Math.floor(totalUnits * 0.75)), icon: "❤️" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>{stat.label}</span>
                    </div>
                    <span className="text-[#111827] dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <h3 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "14px", fontWeight: 600 }}>
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge) => {
                  const earned = history.length >= badge.minDonations;
                  return (
                    <div
                      key={badge.label}
                      className="relative p-4 rounded-xl border transition-all cursor-default"
                      style={{
                        borderColor: earned ? `${badge.glow}44` : "#E5E7EB",
                        background: earned ? `${badge.glow}08` : "#F9FAFB",
                        filter: earned ? "none" : "grayscale(1)",
                        opacity: earned ? 1 : 0.6,
                      }}
                      onMouseEnter={() => setHoveredBadge(badge.label)}
                      onMouseLeave={() => setHoveredBadge(null)}
                    >
                      {!earned && <Lock className="absolute top-2 right-2 w-3 h-3" style={{ color: "#9CA3AF" }} />}
                      <div className="text-2xl mb-2" style={{ filter: earned ? `drop-shadow(0 0 8px ${badge.glow}88)` : "none" }}>
                        {badge.icon}
                      </div>
                      <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "12px", fontWeight: 600 }}>{badge.label}</p>
                      <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>
                        {earned ? badge.desc : `${badge.minDonations - history.length} more needed`}
                      </p>
                      {hoveredBadge === badge.label && !earned && (
                        <div
                          className="absolute bottom-full left-0 mb-2 px-3 py-2 rounded-lg text-white text-xs z-10 whitespace-nowrap"
                          style={{ background: "#111827", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                        >
                          🔒 {badge.minDonations - history.length} more donation{badge.minDonations - history.length > 1 ? "s" : ""} to unlock
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <h3 className="text-[#111827] dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                Emergency Contact
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#F9FAFB] dark:bg-[#0D1117]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", color: "#374151" }}
                >
                  {showPhone ? `+91 ${donor.contact_number}` : `+91 ${donor.contact_number.slice(0, 5)}•••••`}
                </div>
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="p-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#6B7280] hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                >
                  {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <a
                href={`https://wa.me/91${donor.contact_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{ background: "#16A34A", fontSize: "13px", fontWeight: 600 }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Quick Contact
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative bg-white dark:bg-[#1A1F2E] rounded-[16px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#111827] dark:text-white" style={{ fontSize: "17px", fontWeight: 700 }}>Edit Profile</h3>
              <button onClick={() => setShowEdit(false)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Age", key: "age", type: "number" },
                { label: "Contact Number", key: "contact_number", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Address", key: "address", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Availability</label>
                <div className="flex rounded-lg border border-[#E5E7EB] dark:border-gray-600 overflow-hidden">
                  {["Available", "Not Available"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setEditForm((f) => ({ ...f, availability_status: opt }))}
                      className="flex-1 py-2 transition-all"
                      style={{ fontSize: "12px", fontWeight: 500, background: editForm.availability_status === opt ? "#C0152A" : "transparent", color: editForm.availability_status === opt ? "#fff" : "#6B7280" }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {editError && <p className="text-[#C0152A] text-sm">{editError}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] transition-colors"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-lg text-white hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: "#C0152A", fontSize: "13px", fontWeight: 600 }}
              >
                {editLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
