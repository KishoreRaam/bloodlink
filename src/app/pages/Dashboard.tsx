import { useNavigate } from "react-router";
import { Users, CheckCircle, Clock, Droplets, TrendingUp, TrendingDown, ArrowRight, MapPin } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";

const statCards = [
  {
    title: "Total Donors",
    value: "247",
    trend: "+4 this week",
    trendUp: true,
    icon: Users,
    iconColor: "#C0152A",
    iconBg: "#FDECEE",
  },
  {
    title: "Available Now",
    value: "183",
    trend: "74% of total",
    trendUp: true,
    icon: CheckCircle,
    iconColor: "#16A34A",
    iconBg: "#F0FDF4",
  },
  {
    title: "Pending Requests",
    value: "12",
    trend: "3 urgent",
    trendUp: false,
    icon: Clock,
    iconColor: "#D97706",
    iconBg: "#FFFBEB",
  },
  {
    title: "Total Donated",
    value: "94 units",
    trend: "this month",
    trendUp: true,
    icon: Droplets,
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
  },
];

const bloodGroupData = [
  { group: "O+",  count: 52, color: "#C0152A" },
  { group: "A+",  count: 38, color: "#2563EB" },
  { group: "B+",  count: 29, color: "#7C3AED" },
  { group: "AB+", count: 18, color: "#D97706" },
  { group: "O-",  count: 22, color: "#DC2626" },
  { group: "A-",  count: 14, color: "#1D4ED8" },
  { group: "B-",  count: 7,  color: "#5B21B6" },
  { group: "AB-", count: 3,  color: "#B45309" },
];

const maxCount = Math.max(...bloodGroupData.map((d) => d.count));

const recentRequests = [
  { id: "#REQ-001", patient: "Kavya Reddy",  blood: "O-",  hospital: "Apollo Hospital",  date: "Mar 14", status: "Urgent"    as const },
  { id: "#REQ-002", patient: "Arjun Mehta",  blood: "A+",  hospital: "AIIMS Chennai",    date: "Mar 14", status: "Pending"   as const },
  { id: "#REQ-003", patient: "Priya Nair",   blood: "B+",  hospital: "Fortis Health",    date: "Mar 13", status: "Fulfilled" as const },
  { id: "#REQ-004", patient: "Ravi Kumar",   blood: "AB+", hospital: "Manipal Hospital", date: "Mar 13", status: "Pending"   as const },
  { id: "#REQ-005", patient: "Sunita Das",   blood: "O+",  hospital: "Apollo Hospital",  date: "Mar 12", status: "Fulfilled" as const },
];

const recentDonors = [
  { name: "Rahul Kumar",  blood: "O+",  location: "Chennai",    status: "Available"    as const, initials: "RK" },
  { name: "Meena Devi",   blood: "AB+", location: "Coimbatore", status: "Available"    as const, initials: "MD" },
  { name: "Priya Sharma", blood: "A+",  location: "Chennai",    status: "Available"    as const, initials: "PS" },
  { name: "Karthik Raja", blood: "B-",  location: "Madurai",    status: "Not Available" as const, initials: "KR" },
  { name: "Ananya Iyer",  blood: "O-",  location: "Trichy",     status: "Available"    as const, initials: "AI" },
  { name: "Vikram Singh", blood: "B+",  location: "Salem",      status: "Pending"      as const, initials: "VS" },
];

const initialsColor = (name: string) => {
  const colors = ["#C0152A", "#2563EB", "#7C3AED", "#D97706", "#16A34A", "#0891B2"];
  return colors[name.charCodeAt(0) % colors.length];
};

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
            Sunday, March 15, 2026 — Overview & Recent Activity
          </p>
        </div>
        <button
          onClick={() => navigate("/register")}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-md shadow-red-900/20 hover:shadow-lg transition-all hover:scale-[1.02]"
          style={{ background: "#C0152A" }}
        >
          <Users className="w-4 h-4" />
          Register Donor
        </button>
      </div>

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
              onClick={() => navigate("/request")}
              className="flex items-center gap-1 text-[#C0152A] dark:text-[#ff6b7a] hover:underline"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] dark:bg-[#0D1117]/50">
                  {["Patient", "Blood", "Hospital", "Date", "Status", "Action"].map((h) => (
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
                    key={req.id}
                    className="border-t border-[#F3F4F6] dark:border-gray-700/30 hover:bg-[#FDECEE]/40 dark:hover:bg-[#C0152A]/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {req.patient}
                        </p>
                        <p className="text-[#6B7280] dark:text-gray-500" style={{ fontSize: "11px" }}>{req.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BloodGroupBadge group={req.blood} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                      {req.hospital}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                      {req.date}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity"
                        style={{ background: "#C0152A", fontSize: "11px", fontWeight: 600 }}
                      >
                        Fulfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blood Group Availability — custom CSS bars (avoids Recharts key conflicts) */}
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
                    style={{
                      width: "32px",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#6B7280",
                      fontWeight: 600,
                    }}
                  >
                    {entry.group}
                  </span>
                  <div className="flex-1 h-3 bg-[#F3F4F6] dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: entry.color, opacity: 0.85 }}
                    />
                  </div>
                  <span
                    className="flex-shrink-0"
                    style={{ width: "28px", fontSize: "11px", color: "#6B7280", textAlign: "right" }}
                  >
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
            onClick={() => navigate("/search")}
            className="flex items-center gap-1 text-[#C0152A] dark:text-[#ff6b7a] hover:underline"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Search all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDonors.map((donor) => (
            <div
              key={donor.name}
              onClick={() => navigate("/profile")}
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg dark:hover:shadow-black/30 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: initialsColor(donor.name), fontSize: "14px", fontWeight: 700 }}
              >
                {donor.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[#111827] dark:text-gray-100 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {donor.name}
                  </p>
                  <BloodGroupBadge group={donor.blood} size="sm" />
                </div>
                <div className="flex items-center gap-1 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                  <MapPin className="w-3 h-3" />
                  <span>{donor.location}</span>
                </div>
                <div className="mt-1.5">
                  <StatusBadge status={donor.status} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
