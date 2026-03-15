import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Calendar, Share2, Edit3, Eye, EyeOff, MessageCircle, Clock, Lock, Droplets } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";

const DONATIONS = [
  { date: "Jan 15, 2026", bank: "City Blood Bank", location: "Chennai", units: 1, id: "DON-001" },
  { date: "Oct 3, 2025", bank: "LifeCare Blood Center", location: "Trichy", units: 1, id: "DON-002" },
  { date: "Jun 20, 2025", bank: "RedCross Blood Bank", location: "Chennai", units: 1, id: "DON-003" },
];

const BADGES = [
  { icon: "🏅", label: "First Drop", desc: "First donation", earned: true, color: "#D97706", glow: "#F59E0B" },
  { icon: "🔥", label: "3x Donor", desc: "3 donations", earned: true, color: "#C0152A", glow: "#EF4444" },
  { icon: "⭐", label: "Life Saver", desc: "Emergency fulfillment", earned: true, color: "#7C3AED", glow: "#8B5CF6" },
  { icon: "🔒", label: "Iron Donor", desc: "5+ donations needed", earned: false, unlockAt: "2 more donations" },
];

// Next donation: 90 days after Jan 15 = April 15, 2026
const NEXT_ELIGIBLE = new Date("2026-04-15");
const LAST_DONATED = new Date("2026-01-15");
const TODAY = new Date("2026-03-15");
const COOLDOWN_DAYS = 90;
const DAYS_SINCE = Math.floor((TODAY.getTime() - LAST_DONATED.getTime()) / (1000 * 60 * 60 * 24));
const DAYS_REMAINING = Math.max(0, COOLDOWN_DAYS - DAYS_SINCE);
const PROGRESS_PCT = Math.min(100, Math.round((DAYS_SINCE / COOLDOWN_DAYS) * 100));
const IS_ELIGIBLE = DAYS_REMAINING === 0;

export function DonorProfile() {
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

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

      {/* Hero Section */}
      <div
        className="w-full mb-8"
        style={{ background: "linear-gradient(135deg, #C0152A 0%, #7B0A18 100%)" }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/30"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
            >
              <span style={{ color: "#fff", fontSize: "26px", fontWeight: 700 }}>RK</span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 700 }}>Rahul Kumar</h1>
                <BloodGroupBadge group="O+" inverted size="md" />
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="flex items-center gap-1.5 text-white/80" style={{ fontSize: "13px" }}>
                  <MapPin className="w-3.5 h-3.5" /> Chennai
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80" style={{ fontSize: "13px" }}>Age 25</span>
                <span className="text-white/60">•</span>
                <span className="flex items-center gap-1.5 text-white/80" style={{ fontSize: "13px" }}>
                  <Calendar className="w-3.5 h-3.5" /> Member since Jan 2026
                </span>
              </div>
              <StatusBadge status="Available" compact />
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all"
                style={{ fontSize: "13px", fontWeight: 500, backdropFilter: "blur(4px)" }}
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
          {/* Left Column: Eligibility + Donation History */}
          <div className="xl:col-span-7 space-y-5">
            {/* Next Eligibility Card */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              {IS_ELIGIBLE ? (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#F0FDF4" }}>
                  <span className="text-2xl">✅</span>
                  <div>
                    <p style={{ color: "#16A34A", fontSize: "14px", fontWeight: 600 }}>
                      You're eligible to donate today!
                    </p>
                    <p style={{ color: "#15803D", fontSize: "12px" }}>
                      It's been 90+ days since your last donation.
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
                      April 15, 2026
                    </span>
                    <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                      ({DAYS_REMAINING} days remaining)
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-2.5 bg-[#F3F4F6] dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${PROGRESS_PCT}%`, background: "#C0152A" }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>Last donation: Jan 15</span>
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>{PROGRESS_PCT}% of cooldown elapsed</span>
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
                <span
                  className="ml-auto px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: "#C0152A", fontSize: "11px", fontWeight: 600 }}
                >
                  {DONATIONS.length} donations
                </span>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {DONATIONS.map((d, i) => (
                  <div key={d.id} className="relative flex gap-4">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white dark:border-[#1A1F2E] mt-1"
                        style={{ background: "#C0152A", boxShadow: "0 0 0 2px #C0152A33" }}
                      />
                      {i < DONATIONS.length - 1 && (
                        <div className="w-0.5 flex-1 mt-1" style={{ background: "#E5E7EB", minHeight: "32px" }} />
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 mb-3 p-4 rounded-xl border border-[#F3F4F6] dark:border-gray-700/30 hover:border-[#FDECEE] dark:hover:border-[#C0152A]/20 hover:bg-[#FDECEE]/30 dark:hover:bg-[#C0152A]/5 transition-all cursor-default"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {d.bank}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                            <MapPin className="w-3 h-3" />
                            <span>{d.location}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                            {d.date}
                          </p>
                          <p
                            className="mt-0.5"
                            style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#C0152A", fontWeight: 600 }}
                          >
                            {d.units} unit donated
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-5 space-y-5">
            {/* Stats Card */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <h3 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "14px", fontWeight: 600 }}>
                Donation Stats
              </h3>
              <div className="divide-y divide-[#F3F4F6] dark:divide-gray-700/40">
                {[
                  { label: "Total Donations", value: "3", icon: "🩸" },
                  { label: "Blood Donated", value: "3 units", icon: "💉" },
                  { label: "Lives Impacted (est.)", value: "2", icon: "❤️" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-[#111827] dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge System */}
            <div
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <h3 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "14px", fontWeight: 600 }}>
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge) => (
                  <div
                    key={badge.label}
                    className="relative p-4 rounded-xl border transition-all cursor-default"
                    style={{
                      borderColor: badge.earned ? `${badge.glow}44` : "#E5E7EB",
                      background: badge.earned ? `${badge.glow}08` : "#F9FAFB",
                      filter: badge.earned ? "none" : "grayscale(1)",
                      opacity: badge.earned ? 1 : 0.6,
                    }}
                    onMouseEnter={() => setHoveredBadge(badge.label)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    {!badge.earned && (
                      <Lock
                        className="absolute top-2 right-2 w-3 h-3"
                        style={{ color: "#9CA3AF" }}
                      />
                    )}
                    <div
                      className="text-2xl mb-2"
                      style={{
                        filter: badge.earned ? `drop-shadow(0 0 8px ${badge.glow}88)` : "none",
                      }}
                    >
                      {badge.icon}
                    </div>
                    <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {badge.label}
                    </p>
                    <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>
                      {badge.earned ? badge.desc : badge.unlockAt}
                    </p>

                    {/* Tooltip */}
                    {hoveredBadge === badge.label && !badge.earned && (
                      <div
                        className="absolute bottom-full left-0 mb-2 px-3 py-2 rounded-lg text-white text-xs z-10 whitespace-nowrap"
                        style={{ background: "#111827", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                      >
                        🔒 Unlock: {badge.unlockAt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact Card */}
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
                  {showPhone ? "+91 98765 43210" : "+91 98765•••••"}
                </div>
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="p-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#6B7280] dark:text-gray-400 hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                >
                  {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <a
                href="https://wa.me/919876543210"
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
    </div>
  );
}
