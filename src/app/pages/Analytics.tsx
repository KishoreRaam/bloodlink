import { useState } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, Download, FileText, ChevronDown, ChevronUp, BarChart3, Trophy, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";

type DateRange = "This Week" | "This Month" | "Last 3 Months" | "Custom";

const KPI_CARDS = [
  { label: "Donations", value: 94, trend: "+12%", up: true, sparkData: [20, 32, 18, 45, 29, 41, 38, 52, 48, 65, 71, 94] },
  { label: "Requests Raised", value: 47, trend: "+8%", up: true, sparkData: [10, 18, 12, 25, 20, 32, 28, 38, 35, 40, 44, 47] },
  { label: "Fulfilment Rate", value: "87%", trend: "+3%", up: true, sparkData: [72, 74, 68, 79, 81, 78, 83, 85, 82, 86, 88, 87] },
  { label: "New Donors", value: 23, trend: "-5%", up: false, sparkData: [28, 24, 30, 26, 29, 25, 27, 22, 24, 21, 25, 23] },
];

const AREA_DATA = [
  { date: "Mar 1", total: 3, oPos: 1, aPos: 1, bPos: 1, abPos: 0 },
  { date: "Mar 3", total: 6, oPos: 2, aPos: 2, bPos: 1, abPos: 1 },
  { date: "Mar 5", total: 5, oPos: 2, aPos: 1, bPos: 1, abPos: 1 },
  { date: "Mar 7", total: 10, oPos: 4, aPos: 3, bPos: 2, abPos: 1 },
  { date: "Mar 8", total: 12, oPos: 5, aPos: 3, bPos: 3, abPos: 1 },
  { date: "Mar 10", total: 8, oPos: 3, aPos: 2, bPos: 2, abPos: 1 },
  { date: "Mar 12", total: 9, oPos: 4, aPos: 2, bPos: 2, abPos: 1 },
  { date: "Mar 14", total: 11, oPos: 4, aPos: 3, bPos: 3, abPos: 1 },
  { date: "Mar 15", total: 7, oPos: 3, aPos: 2, bPos: 1, abPos: 1 },
];

const DONUT_DATA = [
  { name: "O+", value: 18, color: "#C0152A" },
  { name: "A+", value: 12, color: "#2563EB" },
  { name: "B+", value: 9, color: "#7C3AED" },
  { name: "AB+", value: 4, color: "#D97706" },
  { name: "O-", value: 2, color: "#991B1B" },
  { name: "A-", value: 1, color: "#1D4ED8" },
  { name: "B-", value: 1, color: "#5B21B6" },
];

const HOSPITAL_DATA = [
  { hospital: "Apollo Hospital", requests: 18, fulfilled: 16, pending: 2, rate: 89 },
  { hospital: "AIIMS Chennai", requests: 12, fulfilled: 9, pending: 3, rate: 75 },
  { hospital: "Fortis Health", requests: 8, fulfilled: 6, pending: 2, rate: 75 },
  { hospital: "Manipal Hospital", requests: 6, fulfilled: 3, pending: 3, rate: 50 },
  { hospital: "LifeCare Hospital", requests: 3, fulfilled: 3, pending: 0, rate: 100 },
];

const LEADERBOARD = [
  { rank: 1, name: "Rahul Kumar", blood: "O+", donations: 3, medal: "🥇" },
  { rank: 2, name: "Meena Devi", blood: "AB+", donations: 2, medal: "🥈" },
  { rank: 3, name: "Priya Sharma", blood: "A+", donations: 2, medal: "🥉" },
  { rank: 4, name: "Karthik Raja", blood: "B+", donations: 1, medal: "" },
  { rank: 5, name: "Ananya Iyer", blood: "O-", donations: 1, medal: "" },
];

const rateColor = (rate: number) => {
  if (rate >= 80) return "#16A34A";
  if (rate >= 60) return "#D97706";
  return "#C0152A";
};

function SparkLine({ data, up, uid }: { data: number[]; up: boolean; uid: string }) {
  const gradId = `sg-${uid}-${up}`;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const normalize = (v: number) => max === min ? 0.5 : (v - min) / (max - min);
  const w = 80;
  const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - normalize(v) * h;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;
  const fillD = `${pathD} L ${w},${h} L 0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "#C0152A" : "#6B7280"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={up ? "#C0152A" : "#6B7280"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={up ? "#C0152A" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("This Month");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [activeToggle, setActiveToggle] = useState("All");
  const [sortCol, setSortCol] = useState<string>("rate");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const sorted = [...HOSPITAL_DATA].sort((a, b) => {
    const av = (a as any)[sortCol];
    const bv = (b as any)[sortCol];
    return sortAsc ? av - bv : bv - av;
  });

  const toggleLines: Record<string, string> = {
    All: "#C0152A", "O+": "#C0152A", "A+": "#2563EB", "B+": "#7C3AED", "AB+": "#D97706",
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Analytics & Reports
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
            Data-driven insights for BloodLink operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="relative">
            <button
              onClick={() => setShowDateMenu(!showDateMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-[#1A1F2E] text-[#374151] dark:text-gray-200 hover:border-[#C0152A] transition-all"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {dateRange}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showDateMenu && (
              <div
                className="absolute top-full mt-1 right-0 bg-white dark:bg-[#1A1F2E] rounded-xl border border-[#E5E7EB] dark:border-gray-600 py-1 z-10 min-w-[160px]"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              >
                {(["This Week", "This Month", "Last 3 Months", "Custom"] as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setDateRange(r); setShowDateMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FDECEE] dark:hover:bg-[#C0152A]/10 transition-colors"
                    style={{ fontSize: "13px", color: dateRange === r ? "#C0152A" : "#374151", fontWeight: dateRange === r ? 600 : 400 }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
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

      {/* KPI Cards with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, idx) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px", fontWeight: 500 }}>
                {kpi.label}
              </p>
              <div className="flex items-center gap-1">
                {kpi.up ? (
                  <TrendingUp className="w-3 h-3 text-[#16A34A]" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-[#C0152A]" />
                )}
                <span
                  style={{ fontSize: "11px", fontWeight: 600, color: kpi.up ? "#16A34A" : "#C0152A" }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
            <p className="text-[#111827] dark:text-white mb-3" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.1 }}>
              {kpi.value}
            </p>
            <SparkLine data={kpi.sparkData} up={kpi.up} uid={`kpi-${idx}`} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Area Chart */}
        <div
          className="xl:col-span-7 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              Donation Trends
            </h2>
            <div className="flex gap-1 bg-[#F3F4F6] dark:bg-gray-700/50 p-1 rounded-lg">
              {Object.keys(toggleLines).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveToggle(t)}
                  className="px-2.5 py-1 rounded-md transition-all"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    background: activeToggle === t ? "#C0152A" : "transparent",
                    color: activeToggle === t ? "#fff" : "#6B7280",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={AREA_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C0152A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C0152A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1A1F2E", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey={activeToggle === "All" ? "total" : activeToggle === "O+" ? "oPos" : activeToggle === "A+" ? "aPos" : activeToggle === "B+" ? "bPos" : "abPos"}
                stroke={toggleLines[activeToggle]}
                fill="url(#areaGrad)"
                strokeWidth={2}
                dot={{ r: 3, fill: toggleLines[activeToggle] }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div
          className="xl:col-span-5 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <h2 className="text-[#111827] dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
            Blood Group Demand
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={DONUT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {DONUT_DATA.map((entry, index) => (
                  <Cell key={`analytics-donut-cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1A1F2E", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(value: number, name: string) => [`${value} requests`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Label workaround - positioned below */}
          <div className="text-center -mt-4 mb-3">
            <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>Total Requests: <strong className="text-[#111827] dark:text-white">47</strong></p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DONUT_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
                  {d.name} — {d.value}
                </span>
              </div>
            ))}
          </div>
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
                      className="text-left px-4 py-3 cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-gray-700/30 transition-colors select-none"
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
                  <tr key={row.hospital} className="border-t border-[#F3F4F6] dark:border-gray-700/30 hover:bg-[#F9FAFB] dark:hover:bg-gray-700/10 transition-colors">
                    <td className="px-4 py-3 text-[#111827] dark:text-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>
                      {row.hospital}
                    </td>
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
          <div className="p-3">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                onClick={() => navigate("/profile")}
                className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-[#FDECEE]/50 dark:hover:bg-[#C0152A]/5 cursor-pointer transition-all group"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: entry.rank <= 3 ? "#FFFBEB" : "#F9FAFB",
                    fontSize: entry.medal ? "18px" : "13px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  {entry.medal || entry.rank}
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: entry.rank === 1 ? "#C0152A" : entry.rank === 2 ? "#2563EB" : entry.rank === 3 ? "#7C3AED" : "#6B7280",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {entry.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#111827] dark:text-gray-100 group-hover:text-[#C0152A] transition-colors truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {entry.name}
                  </p>
                  <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                    {entry.donations} donation{entry.donations > 1 ? "s" : ""}
                  </p>
                </div>
                <BloodGroupBadge group={entry.blood} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "16px", fontWeight: 700 }}>
              March 2026 Summary
            </h2>
            <div className="mt-1 h-0.5 w-16 rounded-full" style={{ background: "#C0152A" }} />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{ background: "#C0152A", fontSize: "12px", fontWeight: 600 }}
          >
            <Download className="w-3.5 h-3.5" />
            Download Full Report PDF
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "🩸", label: "Most Requested", value: "O+", sub: "18 requests", color: "#C0152A", warn: false },
            { icon: "🏥", label: "Busiest Hospital", value: "Apollo Chennai", sub: "18 requests", color: "#2563EB", warn: false },
            { icon: "⚠️", label: "Lowest Supply", value: "AB−", sub: "2 units left", color: "#D97706", warn: true },
            { icon: "📅", label: "Peak Day", value: "March 8", sub: "12 donations", color: "#16A34A", warn: false },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl"
              style={{
                background: item.warn ? "#FFFBEB" : "#F9FAFB",
                border: item.warn ? "1px solid #F59E0B33" : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.warn && <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#D97706" }} />}
              </div>
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px", fontWeight: 500 }}>
                {item.label}
              </p>
              <p className="text-[#111827] dark:text-white mt-0.5" style={{ fontSize: "16px", fontWeight: 700, color: item.color }}>
                {item.value}
              </p>
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}