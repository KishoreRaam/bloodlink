import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, CheckCircle, Clock, Droplets, TrendingUp, TrendingDown, ArrowRight, MapPin } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { getDonors, getRequests, type Donor, type PatientRequest } from "../services/api";
import { EmergencyAlertPanel } from "./EmergencyAlertPanel";
import { PriorityQueue } from "./PriorityQueue";

const BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const BLOOD_COLORS: Record<string, string> = {
  "O+": "#C0152A", "A+": "#2563EB", "B+": "#7C3AED", "AB+": "#D97706",
  "O-": "#DC2626", "A-": "#1D4ED8", "B-": "#5B21B6", "AB-": "#B45309",
};

const initialsColor = (name: string) => {
  const colors = ["#C0152A", "#2563EB", "#7C3AED", "#D97706", "#16A34A", "#0891B2"];
  return colors[name.charCodeAt(0) % colors.length];
};

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function Dashboard() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDonors(), getRequests()])
      .then(([d, r]) => {
        setDonors(d);
        setRequests(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalDonors = donors.length;
  const availableDonors = donors.filter((d) => d.availability_status === "Available").length;
  const pendingRequests = requests.filter((r) => r.status === "Pending").length;

  const bloodGroupData = BLOOD_GROUPS.map((group) => ({
    group,
    count: donors.filter((d) => d.blood_group === group).length,
    color: BLOOD_COLORS[group],
  }));
  const maxCount = Math.max(...bloodGroupData.map((d) => d.count), 1);

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime())
    .slice(0, 5);

  const recentDonors = [...donors]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const statCards = [
    {
      title: "Total Donors",
      value: loading ? "—" : String(totalDonors),
      trend: "registered",
      trendUp: true,
      icon: Users,
      iconColor: "#C0152A",
      iconBg: "#FDECEE",
    },
    {
      title: "Available Now",
      value: loading ? "—" : String(availableDonors),
      trend: totalDonors ? `${Math.round((availableDonors / totalDonors) * 100)}% of total` : "0%",
      trendUp: true,
      icon: CheckCircle,
      iconColor: "#16A34A",
      iconBg: "#F0FDF4",
    },
    {
      title: "Pending Requests",
      value: loading ? "—" : String(pendingRequests),
      trend: pendingRequests > 0 ? "awaiting donors" : "all clear",
      trendUp: pendingRequests === 0,
      icon: Clock,
      iconColor: "#D97706",
      iconBg: "#FFFBEB",
    },
    {
      title: "Total Donated",
      value: loading ? "—" : `${requests.filter((r) => r.status === "Fulfilled").length} units`,
      trend: "fulfilled",
      trendUp: true,
      icon: Droplets,
      iconColor: "#7C3AED",
      iconBg: "#F5F3FF",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Overview & Recent Activity
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/register")}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-md shadow-red-900/20 hover:shadow-lg transition-all hover:scale-[1.02]"
          style={{ background: "#C0152A" }}
        >
          <Users className="w-4 h-4" />
          Register Donor
        </button>
      </div>

      {/* Emergency Alert Panel */}
      <EmergencyAlertPanel />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] p-5 border border-[#E5E7EB] dark:border-gray-700/50 hover:scale-[1.02] transition-transform cursor-default"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px", fontWeight: 500 }}>
                {card.title}
              </p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: card.iconBg }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.iconColor }} />
              </div>
            </div>
            <p className="text-[#111827] dark:text-white" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.1 }}>
              {card.value}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {card.trendUp ? (
                <TrendingUp className="w-3 h-3 text-[#16A34A]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-[#C0152A]" />
              )}
              <span
                className={card.trendUp ? "text-[#16A34A]" : "text-[#C0152A]"}
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Waiting Queue */}
      <PriorityQueue />

      {/* Middle Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Recent Patient Requests Table */}
        <div
          className="xl:col-span-7 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-gray-700/50">
            <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              Recent Patient Requests
            </h2>
            <button
              onClick={() => navigate("/admin/request")}
              className="flex items-center gap-1 text-[#C0152A] dark:text-[#ff6b7a] hover:underline"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                Loading requests…
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
                No requests yet
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] dark:bg-[#0D1117]/50">
                    {["Patient", "Blood", "Hospital", "Date", "Status"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[#6B7280] dark:text-gray-500"
                        style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req) => (
                    <tr
                      key={req.request_id}
                      className="border-t border-[#F3F4F6] dark:border-gray-700/30 hover:bg-[#FDECEE]/40 dark:hover:bg-[#C0152A]/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>
                            {req.patient_name}
                          </p>
                          <p className="text-[#6B7280] dark:text-gray-500" style={{ fontSize: "11px" }}>
                            #{String(req.request_id).padStart(3, "0")}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <BloodGroupBadge group={req.blood_group} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                        {req.hospital_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                        {formatDate(req.request_date)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Blood Group Availability */}
        <div
          className="xl:col-span-5 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <h2 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "15px", fontWeight: 600 }}>
            Blood Group Availability
          </h2>
          <div className="space-y-3">
            {bloodGroupData.map((entry) => {
              const pct = Math.round((entry.count / maxCount) * 100);
              return (
                <div key={entry.group} className="flex items-center gap-3">
                  <span
                    className="flex-shrink-0 text-right"
                    style={{ width: "32px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#6B7280", fontWeight: 600 }}
                  >
                    {entry.group}
                  </span>
                  <div className="flex-1 h-3 bg-[#F3F4F6] dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: entry.color, opacity: 0.85 }}
                    />
                  </div>
                  <span className="flex-shrink-0" style={{ width: "28px", fontSize: "11px", color: "#6B7280", textAlign: "right" }}>
                    {entry.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Donor Registrations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
            Recent Donor Registrations
          </h2>
          <button
            onClick={() => navigate("/admin/search")}
            className="flex items-center gap-1 text-[#C0152A] dark:text-[#ff6b7a] hover:underline"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Search all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {loading ? (
          <p className="text-[#6B7280] dark:text-gray-400 text-sm">Loading donors…</p>
        ) : recentDonors.length === 0 ? (
          <p className="text-[#6B7280] dark:text-gray-400 text-sm">No donors registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDonors.map((donor) => (
              <div
                key={donor.donor_id}
                onClick={() => navigate(`/admin/profile/${donor.donor_id}`)}
                className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg dark:hover:shadow-black/30 transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: initialsColor(donor.name), fontSize: "14px", fontWeight: 700 }}
                >
                  {initials(donor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#111827] dark:text-gray-100 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {donor.name}
                    </p>
                    <BloodGroupBadge group={donor.blood_group} size="sm" />
                  </div>
                  {donor.address && (
                    <div className="flex items-center gap-1 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{donor.address.split(",").slice(-1)[0].trim()}</span>
                    </div>
                  )}
                  <div className="mt-1.5">
                    <StatusBadge status={donor.availability_status as any} compact />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
