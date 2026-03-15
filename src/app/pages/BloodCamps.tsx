import { useState } from "react";
import { Plus, MapPin, Clock, Users, X, BarChart3, QrCode, Download, Printer, ChevronRight, Minus } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";

type CampStatus = "Upcoming" | "Active" | "Completed";
type FilterTab = "All" | CampStatus;

interface Camp {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  city: string;
  registered: number;
  capacity: number;
  status: CampStatus;
}

const CAMPS: Camp[] = [
  { id: "C001", name: "SRM Institute Camp", date: "March 22, 2026", time: "9:00 AM – 5:00 PM", location: "Kattankulathur", city: "Chennai", registered: 47, capacity: 100, status: "Upcoming" },
  { id: "C002", name: "Apollo Hospital Drive", date: "March 15, 2026", time: "10:00 AM – 4:00 PM", location: "Greams Road", city: "Chennai", registered: 82, capacity: 100, status: "Active" },
  { id: "C003", name: "IIT Madras Blood Camp", date: "Feb 28, 2026", time: "9:00 AM – 3:00 PM", location: "IIT Campus", city: "Chennai", registered: 120, capacity: 120, status: "Completed" },
  { id: "C004", name: "Rotary Club Drive", date: "April 5, 2026", time: "8:00 AM – 2:00 PM", location: "Anna Nagar", city: "Chennai", registered: 12, capacity: 80, status: "Upcoming" },
  { id: "C005", name: "AIIMS Blood Donation Camp", date: "Feb 14, 2026", time: "9:00 AM – 5:00 PM", location: "AIIMS Campus", city: "Delhi", registered: 95, capacity: 150, status: "Completed" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const statusColors: Record<CampStatus, string> = {
  Upcoming: "#D97706",
  Active: "#16A34A",
  Completed: "#6B7280",
};

function CampDetailModal({ camp, onClose }: { camp: Camp; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"Overview" | "Donors" | "Results">("Overview");

  const mockDonors = [
    { name: "Rahul Kumar", blood: "O+", checkedIn: true },
    { name: "Priya Sharma", blood: "A+", checkedIn: true },
    { name: "Meena Devi", blood: "AB+", checkedIn: false },
    { name: "Karthik Raja", blood: "B+", checkedIn: false },
  ];

  const resultsData = [
    { group: "O+", units: 18 }, { group: "A+", units: 12 }, { group: "B+", units: 9 },
    { group: "AB+", units: 5 }, { group: "O-", units: 8 }, { group: "B-", units: 3 },
  ];
  const maxUnits = Math.max(...resultsData.map((d) => d.units));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#1A1F2E] rounded-[16px] w-full max-w-[800px] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-gray-700/50">
          <div>
            <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
              {camp.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
              <MapPin className="w-3 h-3" />
              <span>{camp.location}, {camp.city}</span>
              <span>•</span>
              <span>{camp.date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB] dark:border-gray-700/50 px-6">
          {(["Overview", "Donors", "Results"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 transition-colors relative"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: activeTab === tab ? "#C0152A" : "#6B7280",
                borderBottom: activeTab === tab ? "2px solid #C0152A" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "Overview" && (
            <div className="space-y-5">
              {/* Map Placeholder */}
              <div
                className="w-full h-40 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)" }}
              >
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                  <p className="text-[#6B7280]" style={{ fontSize: "13px" }}>
                    {camp.location}, {camp.city}
                  </p>
                  <p className="text-[#9CA3AF]" style={{ fontSize: "11px" }}>Map embed placeholder</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Date", value: camp.date },
                  { label: "Time", value: camp.time },
                  { label: "Venue", value: camp.location },
                  { label: "City", value: camp.city },
                  { label: "Capacity", value: `${camp.capacity} donors` },
                  { label: "Registered", value: `${camp.registered} donors` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
                      {item.label.toUpperCase()}
                    </p>
                    <p className="text-[#111827] dark:text-gray-100 mt-1" style={{ fontSize: "14px", fontWeight: 500 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              {/* QR Code */}
              <div className="border-t border-[#E5E7EB] dark:border-gray-700/50 pt-4">
                <p className="text-[#111827] dark:text-white mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                  On-site Registration QR Code
                </p>
                <div
                  className="w-28 h-28 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "#F9FAFB", border: "2px dashed #E5E7EB" }}
                >
                  <QrCode className="w-16 h-16 text-[#374151]" />
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] dark:hover:bg-gray-700"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download QR
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] dark:hover:bg-gray-700"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Donors" && (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] dark:bg-[#0D1117]/50 rounded-xl">
                    {["Name", "Blood Group", "Check-in Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-gray-500"
                        style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockDonors.map((d, i) => (
                    <tr key={i} className="border-t border-[#F3F4F6] dark:border-gray-700/30">
                      <td className="px-4 py-3 text-[#111827] dark:text-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>{d.name}</td>
                      <td className="px-4 py-3"><BloodGroupBadge group={d.blood} size="sm" /></td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            background: d.checkedIn ? "#F0FDF4" : "#F9FAFB",
                            color: d.checkedIn ? "#16A34A" : "#6B7280",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          {d.checkedIn ? "✅ Checked In" : "⏳ Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Results" && (
            <div className="space-y-3">
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>Units collected per blood group</p>
              {resultsData.map((d) => (
                <div key={d.group} className="flex items-center gap-3">
                  <div style={{ width: "40px" }}>
                    <BloodGroupBadge group={d.group} size="sm" />
                  </div>
                  <div className="flex-1 h-6 bg-[#F3F4F6] dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(d.units / maxUnits) * 100}%`, background: "#C0152A" }}
                    >
                      <span className="text-white" style={{ fontSize: "10px", fontWeight: 600 }}>{d.units}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BloodCamps() {
  const [filter, setFilter] = useState<FilterTab>("All");
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [capacity, setCapacity] = useState(100);
  const [targetGroups, setTargetGroups] = useState<string[]>(["A+", "B+", "O+", "AB+"]);

  const filtered = filter === "All" ? CAMPS : CAMPS.filter((c) => c.status === filter);

  const toggleGroup = (g: string) =>
    setTargetGroups((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Blood Donation Camps
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
            Organize and manage donation drives in your area
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white shadow-md shadow-red-900/20 hover:shadow-lg transition-all hover:scale-[1.02]"
          style={{ background: "#C0152A", fontSize: "13px", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Create New Camp
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Camp List */}
        <div className="xl:col-span-5">
          {/* Filter Tabs */}
          <div className="flex gap-1 mb-4 bg-[#F3F4F6] dark:bg-[#1A1F2E] p-1 rounded-xl">
            {(["All", "Upcoming", "Active", "Completed"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="flex-1 py-1.5 rounded-lg transition-all"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  background: filter === tab ? "#fff" : "transparent",
                  color: filter === tab ? "#C0152A" : "#6B7280",
                  boxShadow: filter === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Camp Cards */}
          <div className="space-y-3">
            {filtered.map((camp) => {
              const pct = Math.round((camp.registered / camp.capacity) * 100);
              return (
                <div
                  key={camp.id}
                  className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5 hover:shadow-md dark:hover:shadow-black/20 transition-all"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5" style={{ color: "#C0152A" }} />
                        <h3 className="text-[#111827] dark:text-gray-100 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                          {camp.name}
                        </h3>
                      </div>
                      <p className="text-[#6B7280] dark:text-gray-400 flex items-center gap-1" style={{ fontSize: "12px" }}>
                        <Clock className="w-3 h-3" />
                        {camp.date} • {camp.time}
                      </p>
                      <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
                        📍 {camp.location}, {camp.city}
                      </p>
                    </div>
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: `${statusColors[camp.status]}15`,
                        color: statusColors[camp.status],
                        fontSize: "11px",
                        fontWeight: 600,
                        border: `1px solid ${statusColors[camp.status]}33`,
                      }}
                    >
                      {camp.status === "Active" ? "● " : ""}{camp.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                        {camp.registered}/{camp.capacity} registered
                      </span>
                      <span style={{ fontSize: "11px", color: "#C0152A", fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-[#F3F4F6] dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: "#C0152A" }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCamp(camp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Create/Edit Form */}
        <div className="xl:col-span-7">
          <div
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <h2 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "16px", fontWeight: 600 }}>
              {showCreateForm ? "Create New Camp" : "Camp Details"}
            </h2>

            <div className="space-y-4">
              {[
                { label: "Camp Name", placeholder: "e.g. SRM Blood Drive 2026", type: "text" },
                { label: "Organizer", placeholder: "Organizer name or institution", type: "text" },
                { label: "Venue / Address", placeholder: "Street address", type: "text" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none placeholder-[#9CA3AF] dark:placeholder-gray-600"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              ))}

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Time
                  </label>
                  <div className="flex gap-2">
                    <input type="time" placeholder="Start" className="flex-1 px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none" style={{ fontSize: "13px" }} />
                    <input type="time" placeholder="End" className="flex-1 px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none" style={{ fontSize: "13px" }} />
                  </div>
                </div>
              </div>

              {/* Capacity Stepper */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Max Capacity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCapacity((c) => Math.max(10, c - 10))}
                    className="w-9 h-9 rounded-lg border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-[#6B7280] hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-16 text-center text-[#111827] dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
                    {capacity}
                  </span>
                  <button
                    onClick={() => setCapacity((c) => Math.min(1000, c + 10))}
                    className="w-9 h-9 rounded-lg border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-[#6B7280] hover:border-[#C0152A] hover:text-[#C0152A] transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>donors (min: 10, max: 1000)</span>
                </div>
              </div>

              {/* Target Blood Groups */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Target Blood Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_GROUPS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGroup(g)}
                      className="px-3 py-1.5 rounded-full border transition-all"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderColor: targetGroups.includes(g) ? "#C0152A" : "#E5E7EB",
                        background: targetGroups.includes(g) ? "#FDECEE" : "transparent",
                        color: targetGroups.includes(g) ? "#C0152A" : "#6B7280",
                      }}
                    >
                      {targetGroups.includes(g) ? "✓ " : "○ "}{g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the camp, eligibility criteria, etc."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none placeholder-[#9CA3AF] dark:placeholder-gray-600 resize-none"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white hover:opacity-90 transition-all"
                style={{ background: "#C0152A", fontSize: "14px", fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                Publish Camp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camp Detail Modal */}
      {selectedCamp && (
        <CampDetailModal camp={selectedCamp} onClose={() => setSelectedCamp(null)} />
      )}
    </div>
  );
}
