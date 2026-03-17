import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  LayoutDashboard, User, Droplets, Bell, LogOut,
  MapPin, Calendar, ChevronRight, Eye, EyeOff,
  AlertTriangle, Info, Clock, CheckCircle, Check,
  Edit2, Save, X,
} from "lucide-react";
import { getDonor, getDonorHistory, updateDonor, type Donor, type DonationHistory } from "../services/api";

// Blood group compatibility map
const COMPATIBILITY: Record<string, { donate: string[]; receive: string[] }> = {
  "A+":  { donate: ["A+", "AB+"],                    receive: ["A+", "A-", "O+", "O-"] },
  "A-":  { donate: ["A+", "A-", "AB+", "AB-"],        receive: ["A-", "O-"] },
  "B+":  { donate: ["B+", "AB+"],                    receive: ["B+", "B-", "O+", "O-"] },
  "B-":  { donate: ["B+", "B-", "AB+", "AB-"],        receive: ["B-", "O-"] },
  "O+":  { donate: ["O+", "A+", "B+", "AB+"],         receive: ["O+", "O-"] },
  "O-":  { donate: ["A+","A-","B+","B-","O+","O-","AB+","AB-"], receive: ["O-"] },
  "AB+": { donate: ["AB+"],                           receive: ["A+","A-","B+","B-","O+","O-","AB+","AB-"] },
  "AB-": { donate: ["AB+", "AB-"],                    receive: ["A-", "B-", "O-", "AB-"] },
};

const DONATE_COLORS: Record<string, string> = {
  "O+": "#d72638", "O-": "#b91c1c",
  "A+": "#2563eb", "A-": "#1d4ed8",
  "B+": "#7c3aed", "B-": "#6d28d9",
  "AB+": "#d97706", "AB-": "#b45309",
};

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

type NavItem = "dashboard" | "profile" | "donations" | "notifications";

const PAGE_TITLE: Record<NavItem, string> = {
  dashboard: "Dashboard",
  profile: "My Profile",
  donations: "My Donations",
  notifications: "Notifications",
};

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function nextEligibleDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 90);
  return d;
}

function cooldownPercent(dateStr: string | null): number {
  if (!dateStr) return 100;
  const days = daysSince(dateStr) ?? 0;
  return Math.min(100, Math.round((days / 90) * 100));
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DonorDashboard() {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();
  const donorId = idParam ? Number(idParam) : Number(localStorage.getItem("bl_donor_id"));

  const [donor, setDonor] = useState<Donor | null>(null);
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [showPhone, setShowPhone] = useState(false);
  const [available, setAvailable] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Donor>>({});
  const [saving, setSaving] = useState(false);

  // Notifications state
  const [notifTab, setNotifTab] = useState<"all" | "unread">("all");
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!donorId) { setLoading(false); return; }
    Promise.all([getDonor(donorId), getDonorHistory(donorId)])
      .then(([d, h]) => {
        setDonor(d);
        setAvailable(d.availability_status === "Available");
        setHistory(h);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [donorId]);

  async function toggleAvailability() {
    if (!donor || togglingAvail) return;
    setTogglingAvail(true);
    const newStatus = available ? "Not Available" : "Available";
    try {
      await updateDonor(donor.donor_id, { availability_status: newStatus });
      setAvailable(!available);
      if (donor) setDonor({ ...donor, availability_status: newStatus });
    } catch { /* silent */ }
    finally { setTogglingAvail(false); }
  }

  function startEdit() {
    if (!donor) return;
    setEditForm({
      name: donor.name,
      age: donor.age,
      gender: donor.gender,
      blood_group: donor.blood_group,
      contact_number: donor.contact_number,
      address: donor.address,
    });
    setEditMode(true);
  }

  async function saveProfile() {
    if (!donor || saving) return;
    setSaving(true);
    try {
      await updateDonor(donor.donor_id, editForm);
      setDonor({ ...donor, ...editForm });
      setEditMode(false);
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  function handleLogout() {
    localStorage.removeItem("bl_donor_id");
    localStorage.removeItem("bl_donor");
    navigate("/donor");
  }

  // ── No donor ID ───────────────────────────────────────────
  if (!donorId || (!loading && !donor)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] font-['Inter',sans-serif]">
        <div className="text-center">
          <p className="text-[#6b7280] mb-4 text-[15px]">Please log in to view your dashboard.</p>
          <button onClick={() => navigate("/donor")}
            className="px-6 py-3 bg-[#d72638] text-white rounded-lg font-semibold text-[14px] hover:opacity-90 transition-all">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const initials = donor?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const bloodGroup = donor?.blood_group ?? "—";
  const compat = COMPATIBILITY[bloodGroup] ?? { donate: [], receive: [] };
  const daysAgo = daysSince(donor?.last_donated ?? null);
  const nextDate = nextEligibleDate(donor?.last_donated ?? null);
  const cooldown = cooldownPercent(donor?.last_donated ?? null);
  const isEligible = (daysAgo ?? 999) >= 90;
  const daysLeft = Math.max(0, 90 - (daysAgo ?? 0));

  // ── Dynamic notifications ─────────────────────────────────
  interface Notif { id: string; type: "urgent" | "success" | "warning" | "info"; title: string; body: string; unread: boolean; }
  const notifications: Notif[] = [];
  if (donor) {
    // Emergency (urgent) — only show if blood group is universally needed
    if (["O-", "O+", "AB-"].includes(bloodGroup)) {
      notifications.push({
        id: "emergency",
        type: "urgent",
        title: `Emergency Request — ${bloodGroup} Needed`,
        body: `A patient at a nearby hospital urgently needs ${bloodGroup} blood. You may be a match.`,
        unread: true,
      });
    }
    // Donation confirmed
    if (history.length > 0) {
      const last = history[history.length - 1];
      notifications.push({
        id: "confirmed",
        type: "success",
        title: "Donation Confirmed",
        body: `Your donation on ${fmtDate(last.donation_date)} has been confirmed and recorded. Thank you!`,
        unread: false,
      });
    }
    // Cooldown reminder
    if (!isEligible && donor.last_donated) {
      notifications.push({
        id: "cooldown",
        type: "warning",
        title: "Cooldown Reminder",
        body: `You can donate again after 90 days. Next eligible: ${nextDate ? fmtDate(nextDate.toISOString()) : "—"}.`,
        unread: true,
      });
    }
    // Eligible reminder
    if (isEligible && donor.last_donated) {
      notifications.push({
        id: "eligible",
        type: "success",
        title: "You're Eligible to Donate!",
        body: "90 days have passed since your last donation. You can donate again now!",
        unread: true,
      });
    }
    // Welcome
    notifications.push({
      id: "welcome",
      type: "info",
      title: "Welcome to BloodLink!",
      body: `You've successfully registered as a ${bloodGroup} donor. Your profile is now visible to hospitals.`,
      unread: false,
    });
  }
  const unreadCount = notifications.filter(n => n.unread && !readNotifs.has(n.id)).length;
  const displayedNotifs = notifTab === "unread"
    ? notifications.filter(n => n.unread && !readNotifs.has(n.id))
    : notifications;

  const navItems: { key: NavItem; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "dashboard",     label: "Dashboard",     icon: LayoutDashboard },
    { key: "profile",       label: "My Profile",    icon: User },
    { key: "donations",     label: "My Donations",  icon: Droplets },
    { key: "notifications", label: "Notifications", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  // ── Profile view ──────────────────────────────────────────
  function renderProfile() {
    return (
      <div className="max-w-[640px] mx-auto">
        <div className="bg-white rounded-[16px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* Avatar header */}
          <div className="flex items-center gap-5 px-8 py-6 border-b border-[#f3f4f6]">
            <div className="w-20 h-20 rounded-full bg-[#d72638] flex items-center justify-center shadow-[0px_4px_20px_rgba(215,38,56,0.38)] flex-shrink-0">
              <span className="text-white font-extrabold text-[26px]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[#1a1a2e] font-extrabold text-[20px] truncate">{donor?.name ?? "—"}</h2>
              <span className="inline-block bg-[#d72638] text-white font-bold text-[13px] font-mono px-3 py-0.5 rounded-full mt-1.5">
                {bloodGroup}
              </span>
            </div>
            {!editMode ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#d72638] rounded-[10px] text-[#d72638] text-[14px] font-semibold hover:bg-[#FDECEE] transition-all flex-shrink-0"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-[#e5e7eb] rounded-[10px] text-[#6b7280] text-[14px] font-semibold hover:bg-[#f9fafb] transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#d72638] rounded-[10px] text-white text-[14px] font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Data rows */}
          <div>
            {/* Full Name */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(0,0,0,0.05)]">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0">Full Name</span>
              {editMode ? (
                <input
                  value={editForm.name ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="flex-1 text-right text-[14px] text-[#1a1a2e] font-semibold border border-[#e5e7eb] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#d72638] focus:ring-1 focus:ring-[#d72638]/20"
                />
              ) : (
                <span className="text-[#1a1a2e] text-[14px] font-semibold">{donor?.name ?? "—"}</span>
              )}
            </div>

            {/* Age */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(0,0,0,0.05)]">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0">Age</span>
              {editMode ? (
                <input
                  type="number"
                  min={18} max={65}
                  value={editForm.age ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, age: Number(e.target.value) }))}
                  className="w-24 text-right text-[14px] text-[#1a1a2e] font-semibold border border-[#e5e7eb] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#d72638] focus:ring-1 focus:ring-[#d72638]/20"
                />
              ) : (
                <span className="text-[#1a1a2e] text-[14px] font-semibold">{donor?.age ?? "—"}</span>
              )}
            </div>

            {/* Gender */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(0,0,0,0.05)]">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0">Gender</span>
              {editMode ? (
                <div className="flex gap-2">
                  {["Male", "Female", "Other"].map(g => (
                    <button
                      key={g}
                      onClick={() => setEditForm(f => ({ ...f, gender: g }))}
                      className="px-3 py-1.5 rounded-[8px] text-[13px] font-semibold border transition-all"
                      style={{
                        background: editForm.gender === g ? "#d72638" : "transparent",
                        color: editForm.gender === g ? "#fff" : "#6b7280",
                        borderColor: editForm.gender === g ? "#d72638" : "#e5e7eb",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[#1a1a2e] text-[14px] font-semibold">{donor?.gender ?? "—"}</span>
              )}
            </div>

            {/* Blood Group */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(0,0,0,0.05)]">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0">Blood Group</span>
              {editMode ? (
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUPS.map(g => (
                    <button
                      key={g}
                      onClick={() => setEditForm(f => ({ ...f, blood_group: g }))}
                      className="px-3 py-1 rounded-full text-[13px] font-bold font-mono border transition-all"
                      style={{
                        background: editForm.blood_group === g ? "#d72638" : "transparent",
                        color: editForm.blood_group === g ? "#fff" : "#6b7280",
                        borderColor: editForm.blood_group === g ? "#d72638" : "#e5e7eb",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="bg-[#d72638] text-white font-bold text-[13px] font-mono px-3 py-0.5 rounded-full">
                  {bloodGroup}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(0,0,0,0.05)]">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0">Phone</span>
              {editMode ? (
                <input
                  type="tel"
                  value={editForm.contact_number ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, contact_number: e.target.value }))}
                  className="flex-1 text-right text-[14px] text-[#1a1a2e] font-semibold border border-[#e5e7eb] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#d72638] focus:ring-1 focus:ring-[#d72638]/20 font-mono"
                />
              ) : (
                <span className="text-[#1a1a2e] text-[14px] font-semibold font-mono">{donor?.contact_number ?? "—"}</span>
              )}
            </div>

            {/* Address */}
            <div className="flex items-start justify-between px-8 py-4 border-b border-[rgba(0,0,0,0.05)]">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0 pt-1">Address</span>
              {editMode ? (
                <textarea
                  value={editForm.address ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="flex-1 text-right text-[14px] text-[#1a1a2e] font-semibold border border-[#e5e7eb] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#d72638] focus:ring-1 focus:ring-[#d72638]/20 resize-none"
                />
              ) : (
                <span className="text-[#1a1a2e] text-[14px] font-semibold text-right max-w-[360px]">{donor?.address ?? "—"}</span>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between px-8 py-4">
              <span className="text-[#6b7280] text-[13px] w-32 flex-shrink-0">Status</span>
              <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${available ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                <span className={`w-2 h-2 rounded-full ${available ? "bg-[#16a34a]" : "bg-[#9ca3af]"}`} />
                {available ? "Available" : "Not Available"}
              </span>
            </div>
          </div>

          {/* Donation Availability footer */}
          <div className="px-8 py-5 bg-[#f9fafb] border-t border-[#f3f4f6] flex items-center justify-between">
            <div>
              <p className="text-[#1a1a2e] font-semibold text-[14px]">Donation Availability</p>
              <p className="text-[#9ca3af] text-[12px] mt-0.5">Toggle to update your availability status</p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={togglingAvail}
              className={`relative w-14 h-7 rounded-full transition-all ${available ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`}
            >
              <span
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.15)] transition-all"
                style={{ left: available ? "calc(100% - 26px)" : "2px" }}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── My Donations view ─────────────────────────────────────
  function renderDonations() {
    const lastDonation = history.length > 0 ? history[history.length - 1] : null;
    return (
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-[#1a1a2e] font-extrabold text-[22px]">My Donation History</h2>
          <p className="text-[#9ca3af] text-[13px] mt-1">Track all your blood donations and their impact.</p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2.5 bg-white border border-[#e5e7eb] rounded-full px-5 py-2.5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
            <Droplets className="w-4 h-4 text-[#d72638]" />
            <span className="text-[#1a1a2e] font-bold text-[14px]">{history.length} Total Donation{history.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-[#e5e7eb] rounded-full px-5 py-2.5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
            <Clock className="w-4 h-4 text-[#6b7280]" />
            <span className="text-[#374151] text-[14px] font-semibold">
              Last: {lastDonation ? fmtDate(lastDonation.donation_date) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-[#e5e7eb] rounded-full px-5 py-2.5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
            <Clock className="w-4 h-4 text-[#6b7280]" />
            <span className="text-[#374151] text-[14px] font-semibold">
              Next Eligible: {nextDate ? fmtDate(nextDate.toISOString()) : "Ready Now"}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-[#f3f4f6] rounded animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Droplets className="w-12 h-12 text-[#e5e7eb] mb-4" />
              <p className="text-[#111827] font-semibold text-[16px]">No donations yet</p>
              <p className="text-[#9ca3af] text-[13px] mt-1.5 max-w-[280px]">
                Your donation history will appear here after your first donation is recorded.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f9fafb]">
                      {["#", "Blood Bank", "Location", "Donation Date", "Units", "Days Since", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#9ca3af] tracking-[0.66px] uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => {
                      const ds = daysSince(row.donation_date);
                      return (
                        <tr key={row.donation_id} className="border-t border-[#f3f4f6] hover:bg-[#fafafa] transition-colors cursor-pointer">
                          <td className="px-5 py-4 text-[#9ca3af] text-[13px] font-semibold">{i + 1}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-[rgba(215,38,56,0.07)] rounded-[8px] flex items-center justify-center flex-shrink-0">
                                <Droplets className="w-3.5 h-3.5 text-[#d72638]" />
                              </div>
                              <span className="text-[#1a1a2e] text-[14px] font-semibold whitespace-nowrap">{row.blood_bank_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5 text-[#6b7280] text-[13px] whitespace-nowrap">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {row.blood_bank_city}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5 text-[#6b7280] text-[13px] whitespace-nowrap">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {fmtDate(row.donation_date)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center bg-[rgba(215,38,56,0.08)] text-[#d72638] text-[12px] font-bold px-2.5 py-0.5 rounded-full">
                              {row.quantity_donated} unit{row.quantity_donated !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#374151] text-[13px] font-semibold">
                            {ds !== null ? `${ds}d ago` : "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] text-[12px] font-semibold px-3 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-[#f3f4f6] flex items-center justify-between">
                <span className="text-[#9ca3af] text-[12px]">
                  Showing {history.length} of {history.length} donation{history.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[#9ca3af] text-[12px]">Click any row to see details</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Notifications view ─────────────────────────────────────
  function renderNotifications() {
    const unread = notifications.filter(n => n.unread && !readNotifs.has(n.id)).length;

    const notifIconBg: Record<Notif["type"], string> = {
      urgent: "bg-[rgba(215,38,56,0.1)]",
      success: "bg-[rgba(22,163,74,0.08)]",
      warning: "bg-[rgba(234,88,12,0.08)]",
      info: "bg-[rgba(37,99,235,0.08)]",
    };
    const notifIconColor: Record<Notif["type"], string> = {
      urgent: "text-[#d72638]",
      success: "text-[#16a34a]",
      warning: "text-[#ea580c]",
      info: "text-[#2563eb]",
    };

    return (
      <div className="max-w-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1a1a2e] font-extrabold text-[22px]">Notifications</h2>
            <p className="text-[#9ca3af] text-[13px] mt-1">
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={() => setReadNotifs(new Set(notifications.filter(n => n.unread).map(n => n.id)))}
              className="flex items-center gap-1.5 text-[#d72638] text-[13px] font-semibold hover:underline"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["all", "unread"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setNotifTab(tab)}
              className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
              style={{
                background: notifTab === tab ? "#1a1a2e" : "#f3f4f6",
                color: notifTab === tab ? "#fff" : "#6b7280",
              }}
            >
              {tab === "all" ? `All (${notifications.length})` : `Unread (${unread})`}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {displayedNotifs.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
              <Bell className="w-10 h-10 text-[#e5e7eb] mb-3" />
              <p className="text-[#111827] font-semibold text-[15px]">No notifications</p>
              <p className="text-[#9ca3af] text-[13px] mt-1">You're all caught up!</p>
            </div>
          ) : displayedNotifs.map(notif => {
            const isUnread = notif.unread && !readNotifs.has(notif.id);
            return (
              <div
                key={notif.id}
                className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] overflow-hidden transition-all"
                style={{
                  borderLeft: notif.type === "urgent" ? "3px solid #d72638" : "3px solid transparent",
                }}
              >
                <div className="px-5 py-4 flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-[12px] ${notifIconBg[notif.type]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {notif.type === "urgent" ? (
                      <svg viewBox="0 0 20 20" className={`w-5 h-5 ${notifIconColor[notif.type]} fill-current`}>
                        <path d="M10 2C7.2 2 5 6.2 5 9c0 4.4 5 10 5 10s5-5.6 5-10c0-2.8-2.2-7-5-7zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    ) : notif.type === "success" ? (
                      <CheckCircle className={`w-5 h-5 ${notifIconColor[notif.type]}`} />
                    ) : notif.type === "warning" ? (
                      <Clock className={`w-5 h-5 ${notifIconColor[notif.type]}`} />
                    ) : (
                      <Bell className={`w-5 h-5 ${notifIconColor[notif.type]}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#1a1a2e] font-bold text-[14px]">{notif.title}</span>
                      {isUnread && (
                        <span className="relative flex w-2 h-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d72638] opacity-75" />
                          <span className="relative inline-flex rounded-full w-2 h-2 bg-[#d72638]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[#6b7280] text-[13px] leading-[1.6]">{notif.body}</p>
                    {notif.type === "urgent" && (
                      <button
                        className="mt-3 px-4 py-2 bg-[#d72638] text-white text-[13px] font-semibold rounded-[8px] hover:opacity-90 transition-all"
                        onClick={() => navigate("/admin/request")}
                      >
                        View Request →
                      </button>
                    )}
                  </div>

                  {/* Mark read */}
                  {isUnread && (
                    <button
                      onClick={() => setReadNotifs(prev => new Set([...prev, notif.id]))}
                      className="text-[#9ca3af] hover:text-[#374151] transition-colors flex-shrink-0 mt-0.5"
                      title="Mark as read"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Dashboard view ────────────────────────────────────────
  function renderDashboard() {
    return (
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] p-6">
            <div className="w-11 h-11 bg-[rgba(215,38,56,0.07)] rounded-[14px] flex items-center justify-center mb-5">
              <Droplets className="w-5 h-5 text-[#d72638]" />
            </div>
            <p className="text-[#1a1a2e] font-extrabold text-[40px] leading-none mb-2">
              {loading ? "—" : history.length}
            </p>
            <p className="text-[#6b7280] text-[13px]">Total Donations Made</p>
          </div>

          <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] p-6">
            <div className="w-11 h-11 bg-[rgba(215,38,56,0.07)] rounded-[14px] flex items-center justify-center mb-5">
              <svg viewBox="0 0 20 20" className="w-5 h-5 text-[#d72638] fill-current">
                <path d="M10 17.5s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"/>
              </svg>
            </div>
            <p className="text-[#1a1a2e] font-extrabold text-[40px] leading-none mb-2">
              {loading ? "—" : history.length}
            </p>
            <p className="text-[#6b7280] text-[13px]">Lives Potentially Saved</p>
          </div>

          <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 bg-[rgba(215,38,56,0.07)] rounded-[14px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#d72638]" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                isEligible ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fff7ed] text-[#ea580c]"
              }`}>
                {isEligible ? "✅ Eligible Now" : "⏳ Not Yet Eligible"}
              </span>
            </div>
            {nextDate ? (
              <>
                <p className="text-[#1a1a2e] font-extrabold text-[24px] leading-none mb-1">
                  {nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-[#6b7280] text-[13px]">Next Eligible to Donate</p>
                <p className="text-[#9ca3af] text-[11px] mt-1">90 days after last donation</p>
              </>
            ) : (
              <>
                <p className="text-[#1a1a2e] font-extrabold text-[24px] leading-none mb-1">Ready Now</p>
                <p className="text-[#6b7280] text-[13px]">Next Eligible to Donate</p>
                <p className="text-[#9ca3af] text-[11px] mt-1">No donations on record</p>
              </>
            )}
          </div>
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-12 gap-5">

          {/* Left col */}
          <div className="col-span-7 space-y-5">
            {/* My Profile summary */}
            <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
                <span className="text-[#1a1a2e] font-bold text-[16px]">My Profile</span>
                <button
                  onClick={() => setActiveNav("profile")}
                  className="px-4 py-2 border-2 border-[#d72638] rounded-lg text-[#d72638] text-[14px] font-semibold hover:bg-[#FDECEE] transition-all"
                >
                  Edit Profile
                </button>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-[#f3f4f6] rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div>
                  {[
                    { label: "Full Name", value: donor?.name ?? "—" },
                    { label: "Age",       value: donor?.age?.toString() ?? "—" },
                    { label: "Gender",    value: donor?.gender ?? "—" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
                      <span className="text-[#6b7280] text-[13px]">{row.label}</span>
                      <span className="text-[#1a1a2e] text-[13px] font-semibold">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
                    <span className="text-[#6b7280] text-[13px]">Blood Group</span>
                    <span className="bg-[#d72638] text-white font-bold text-[13px] font-mono px-3 py-0.5 rounded-full">{bloodGroup}</span>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
                    <span className="text-[#6b7280] text-[13px]">Phone</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1a1a2e] text-[13px] font-mono">
                        {showPhone ? donor?.contact_number : `${(donor?.contact_number ?? "").slice(0, 5)}•••••`}
                      </span>
                      <button onClick={() => setShowPhone(!showPhone)} className="text-[#d72638] text-[11px] font-semibold flex items-center gap-0.5 hover:underline">
                        {showPhone ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showPhone ? "Hide" : "Reveal"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
                    <span className="text-[#6b7280] text-[13px]">Address</span>
                    <span className="text-[#1a1a2e] text-[13px] font-semibold text-right max-w-[220px] truncate">{donor?.address ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-[#6b7280] text-[13px]">Status</span>
                    <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${available ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                      <span className={`w-2 h-2 rounded-full ${available ? "bg-[#16a34a]" : "bg-[#9ca3af]"}`} />
                      {available ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] p-6">
              <p className="text-[#1a1a2e] font-bold text-[16px] mb-4">Quick Actions</p>
              <div className="space-y-3">
                {[
                  { icon: <User className="w-4 h-4" />, label: "Edit My Profile", nav: "profile" as NavItem },
                  { icon: <Droplets className="w-4 h-4" />, label: "View Donation History", nav: "donations" as NavItem },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={() => setActiveNav(action.nav)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-[#e5e7eb] rounded-[10px] hover:bg-[#f9fafb] transition-all group"
                  >
                    <div className="flex items-center gap-3 text-[#374151] text-[14px] font-semibold">
                      <span className="text-[#6b7280] group-hover:text-[#d72638] transition-colors">{action.icon}</span>
                      {action.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9ca3af]" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="col-span-5 space-y-5">
            {/* My Availability */}
            <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] p-6">
              <p className="text-[#1a1a2e] font-bold text-[16px] mb-6">My Availability</p>
              <div className="flex flex-col items-center gap-3 mb-6">
                <button
                  onClick={toggleAvailability}
                  disabled={togglingAvail}
                  className={`relative w-20 h-10 rounded-full transition-all shadow-[0px_0px_20px_rgba(22,163,74,0.25)] ${available ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`}
                >
                  <span
                    className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-[0px_10px_15px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] transition-all"
                    style={{ left: available ? "calc(100% - 36px)" : "4px" }}
                  />
                </button>
                <p className={`font-bold text-[16px] ${available ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                  You are currently {available ? "AVAILABLE" : "UNAVAILABLE"}
                </p>
                <p className="text-[#9ca3af] text-[12px] text-center leading-[1.5] max-w-[200px]">
                  {available
                    ? "Hospitals can find and contact you for emergency blood requests."
                    : "You are hidden from hospital search results."}
                </p>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Cooldown progress</span>
                  <span className="text-[#9ca3af] text-[11px]">{isEligible ? "Eligible!" : `${daysLeft} days left`}</span>
                </div>
                <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cooldown}%`,
                      background: isEligible ? "#16a34a" : "linear-gradient(90deg, #d72638, #f97316)",
                    }}
                  />
                </div>
              </div>
              <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#ea580c] flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#92400e] leading-[1.6]">
                  <strong>Please keep this updated.</strong>{" "}
                  Inaccurate availability delays emergency response.
                </p>
              </div>
            </div>

            {/* Blood Group */}
            <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] p-6">
              <p className="text-[#1a1a2e] font-bold text-[16px] mb-6">Your Blood Group Can Help</p>
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="w-20 h-20 rounded-full bg-[rgba(215,38,56,0.08)] border-2 border-[rgba(215,38,56,0.25)] flex items-center justify-center">
                  <span className="text-[#d72638] font-extrabold text-[28px] font-mono">{bloodGroup}</span>
                </div>
                <span className="text-[#9ca3af] text-[11px]">Your blood type</span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-[#6b7280] text-[12px] font-semibold">You can donate to:</p>
                <div className="flex flex-wrap gap-2">
                  {compat.donate.map(g => (
                    <span key={g} className="px-2.5 py-1 rounded-full text-white text-[12px] font-bold font-mono" style={{ background: DONATE_COLORS[g] ?? "#6b7280" }}>{g}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-[#6b7280] text-[12px] font-semibold">You can receive from:</p>
                <div className="flex flex-wrap gap-2">
                  {compat.receive.map(g => (
                    <span key={g} className="px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#374151] text-[12px] font-bold font-mono">{g}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[rgba(215,38,56,0.03)] border border-[rgba(215,38,56,0.13)] rounded-[10px] p-3 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#d72638] flex-shrink-0 mt-0.5" />
                <p className="text-[#6b7280] text-[11px] leading-[1.6]">
                  {bloodGroup === "O-"
                    ? "O- donors are universal donors — the most needed in emergencies. Thank you!"
                    : bloodGroup === "AB+"
                    ? "AB+ donors can receive from any blood type. You're a universal recipient!"
                    : `${bloodGroup} donors are among the most needed. Thank you for registering!`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Donation History preview */}
        <div className="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3f4f6]">
            <div>
              <p className="text-[#1a1a2e] font-bold text-[16px]">My Donation History</p>
              <p className="text-[#9ca3af] text-[12px] mt-0.5">All your past blood donations</p>
            </div>
            <button
              onClick={() => setActiveNav("donations")}
              className="flex items-center gap-1 text-[#d72638] text-[14px] font-semibold hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-[#f3f4f6] rounded animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Droplets className="w-10 h-10 text-[#e5e7eb] mb-3" />
              <p className="text-[#111827] font-semibold text-[15px]">No donations yet</p>
              <p className="text-[#9ca3af] text-[13px] mt-1">Your donation history will appear here after your first donation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9fafb]">
                    {["#", "Blood Bank", "Location", "Date", "Units Donated", "Status"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-bold text-[#9ca3af] tracking-[0.66px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((row, i) => (
                    <tr key={row.donation_id} className="border-t border-[#f3f4f6] hover:bg-[#fafafa] transition-colors">
                      <td className="px-6 py-4 text-[#9ca3af] text-[13px] font-semibold">{i + 1}</td>
                      <td className="px-6 py-4 text-[#1a1a2e] text-[14px] font-semibold">{row.blood_bank_name}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[#6b7280] text-[13px]">
                          <MapPin className="w-3 h-3 flex-shrink-0" />{row.blood_bank_city}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[#6b7280] text-[13px]">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          {fmtDate(row.donation_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#374151] text-[13px]">{row.quantity_donated} unit{row.quantity_donated !== 1 ? "s" : ""}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] text-[12px] font-semibold px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full" />Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-['Inter',sans-serif] overflow-hidden">

      {/* ── Sidebar ─────────────────────────── */}
      <div className="w-[240px] flex-shrink-0 bg-[#1a1a2e] border-r border-[rgba(255,255,255,0.08)] flex flex-col">

        {/* Logo */}
        <div className="h-[77px] flex items-center px-5 border-b border-[rgba(255,255,255,0.08)]">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#d72638] rounded-[14px] shadow-[0px_4px_14px_rgba(215,38,56,0.38)] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
                <path d="M10 2C7.2 2 5 6.2 5 9c0 4.4 5 10 5 10s5-5.6 5-10c0-2.8-2.2-7-5-7zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </div>
            <span className="text-white font-extrabold text-[18px] tracking-[-0.5px]">BloodLink</span>
          </button>
        </div>

        {/* Donor profile */}
        <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.08)] flex flex-col items-center gap-3">
          {loading ? (
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.1)] animate-pulse" />
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#d72638] flex items-center justify-center shadow-[0px_4px_20px_rgba(215,38,56,0.38)]">
                <span className="text-white font-extrabold text-[20px]">{initials}</span>
              </div>
              <span className="text-white font-semibold text-[16px]">{donor?.name ?? "—"}</span>
              <span className="bg-[#d72638] text-white font-bold text-[14px] font-mono px-3 py-0.5 rounded-full shadow-[0px_2px_8px_rgba(215,38,56,0.31)]">
                {bloodGroup}
              </span>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {navItems.map(item => {
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[14px] text-[14px] transition-all relative"
                style={{
                  background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#d72638] rounded-r-full" />}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="w-4 h-4 bg-[#d72638] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-3 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[14px] text-[#d72638] text-[14px] font-semibold hover:bg-[rgba(215,38,56,0.1)] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ── Main ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <div className="h-16 bg-white border-b border-[#e5e7eb] shadow-[0px_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between px-6 flex-shrink-0">
          <span className="text-[#111827] font-bold text-[20px]">{PAGE_TITLE[activeNav]}</span>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#374151] text-[14px] font-semibold">I'm Available to Donate</p>
              <p className="text-[#9ca3af] text-[12px]">
                {daysAgo !== null ? `Last donated: ${daysAgo} days ago` : "No donations yet"}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={togglingAvail}
              className={`relative w-12 h-6 rounded-full transition-all ${available ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-[0px_4px_6px_rgba(0,0,0,0.1)] transition-all"
                style={{ left: available ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {activeNav === "dashboard"     && renderDashboard()}
          {activeNav === "profile"       && renderProfile()}
          {activeNav === "donations"     && renderDonations()}
          {activeNav === "notifications" && renderNotifications()}
        </div>
      </div>
    </div>
  );
}
