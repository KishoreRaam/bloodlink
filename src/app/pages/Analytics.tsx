import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, Download, FileText, ChevronDown, ChevronUp, Trophy, Droplets } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { getAnalytics, type AnalyticsSummary } from "../services/api";

const BLOOD_COLORS: Record<string, string> = {
  "O+": "#C0152A", "A+": "#2563EB", "B+": "#7C3AED", "AB+": "#D97706",
  "O-": "#DC2626", "A-": "#1D4ED8", "B-": "#5B21B6", "AB-": "#B45309",
};

const rateColor = (rate: number) =>
  rate >= 80 ? "#16A34A" : rate >= 60 ? "#D97706" : "#C0152A";

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const initialsColor = (name: string) => {
  const colors = ["#C0152A", "#2563EB", "#7C3AED", "#D97706", "#16A34A", "#0891B2"];
  return colors[name.charCodeAt(0) % colors.length];
};

export function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState("requests");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Droplets className="w-8 h-8 animate-pulse" style={{ color: "#C0152A" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-[#6B7280] dark:text-gray-400">Failed to load analytics.</p>
      </div>
    );
  }

  const { kpis, blood_group_demand, hospital_stats, leaderboard } = data;

  const kpiCards = [
    { label: "Total Donors",    value: kpis.total_donors,        trend: kpis.available_donors + " available", up: true },
    { label: "Requests Raised", value: kpis.total_requests,       trend: kpis.pending_requests + " pending",  up: kpis.pending_requests === 0 },
    { label: "Fulfilment Rate", value: kpis.fulfilment_rate + "%", trend: kpis.fulfilled_requests + " fulfilled", up: kpis.fulfilment_rate >= 80 },
    { label: "Available Now",   value: kpis.available_donors,     trend: kpis.total_donors > 0 ? Math.round((kpis.available_donors / kpis.total_donors) * 100) + "% of total" : "0%", up: true },
  ];

  const donutData = blood_group_demand
    .filter((d) => d.requests > 0)
    .map((d) => ({ name: d.group, value: d.requests, color: BLOOD_COLORS[d.group] ?? "#6B7280" }));

  const barData = blood_group_demand.map((d) => ({
    date: d.group,
    donors: d.donors,
    requests: d.requests,
  }));

  const sorted = [...hospital_stats].sort((a, b) => {
    const av = (a as any)[sortCol] ?? 0;
    const bv = (b as any)[sortCol] ?? 0;
    return sortAsc ? av - bv : bv - av;
  });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Analytics & Reports
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
            Live data from BloodLink operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-200 hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-all"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <FileText className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-200 hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-all"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px", fontWeight: 500 }}>
                {kpi.label}
              </p>
              {kpi.up ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[#C0152A]" />
              )}
            </div>
            <p className="text-[#111827] dark:text-white mb-1" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.1 }}>
              {kpi.value}
            </p>
            <p style={{ fontSize: "11px", color: kpi.up ? "#16A34A" : "#C0152A", fontWeight: 500 }}>
              {kpi.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Bar chart — donors vs requests by blood group */}
        <div
          className="xl:col-span-7 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <h2 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "15px", fontWeight: 600 }}>
            Donors vs Requests by Blood Group
          </h2>
          {barData.every((d) => d.donors === 0 && d.requests === 0) ? (
            <div className="flex items-center justify-center h-[220px] text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
              No data yet — register donors and create requests to see trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDonors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0152A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C0152A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1A1F2E", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="donors" stroke="#C0152A" fill="url(#gradDonors)" strokeWidth={2} name="Donors" />
                <Area type="monotone" dataKey="requests" stroke="#2563EB" fill="url(#gradRequests)" strokeWidth={2} name="Requests" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart — blood group demand */}
        <div
          className="xl:col-span-5 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <h2 className="text-[#111827] dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
            Blood Group Demand
          </h2>
          {donutData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
              No requests yet.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1A1F2E", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    formatter={(value: number, name: string) => [`${value} requests`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-4 mb-3">
                <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                  Total Requests: <strong className="text-[#111827] dark:text-white">{kpis.total_requests}</strong>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
                      {d.name} — {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hospital Table */}
        <div
          className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-gray-700/50">
            <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              Hospital-wise Requests
            </h2>
          </div>
          {hospital_stats.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
              No requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] dark:bg-[#0D1117]/50">
                    {[
                      { label: "Hospital", key: "hospital" },
                      { label: "Total", key: "requests" },
                      { label: "Fulfilled", key: "fulfilled" },
                      { label: "Pending", key: "pending" },
                      { label: "Rate", key: "rate" },
                    ].map((h) => (
                      <th
                        key={h.key}
                        className="text-left px-4 py-3 cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-gray-700/30 select-none"
                        style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", color: "#6B7280" }}
                        onClick={() => handleSort(h.key)}
                      >
                        <span className="flex items-center gap-1">
                          {h.label.toUpperCase()}
                          {sortCol === h.key && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr key={row.hospital} className="border-t border-[#F3F4F6] dark:border-gray-700/30 hover:bg-[#F9FAFB] dark:hover:bg-gray-700/10">
                      <td className="px-4 py-3 text-[#111827] dark:text-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>{row.hospital}</td>
                      <td className="px-4 py-3 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>{row.requests}</td>
                      <td className="px-4 py-3 text-[#16A34A]" style={{ fontSize: "13px", fontWeight: 500 }}>{row.fulfilled}</td>
                      <td className="px-4 py-3 text-[#D97706]" style={{ fontSize: "13px", fontWeight: 500 }}>{row.pending}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            background: `${rateColor(row.rate)}15`,
                            color: rateColor(row.rate),
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div
          className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-gray-700/50 flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: "#D97706" }} />
            <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              Top Donors Leaderboard
            </h2>
          </div>
          {leaderboard.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
              No donations recorded yet.
            </div>
          ) : (
            <div className="p-3">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.donor_id}
                  onClick={() => navigate(`/profile/${entry.donor_id}`)}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-[#FDECEE]/50 dark:hover:bg-[#C0152A]/5 cursor-pointer transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: i < 3 ? "#FFFBEB" : "#F9FAFB",
                      fontSize: i < 3 ? "18px" : "13px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    {i < 3 ? medals[i] : i + 1}
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: initialsColor(entry.name), fontSize: "12px", fontWeight: 700 }}
                  >
                    {initials(entry.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#111827] dark:text-gray-100 group-hover:text-[#C0152A] truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {entry.name}
                    </p>
                    <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                      {entry.donations} donation{entry.donations !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <BloodGroupBadge group={entry.blood_group} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
