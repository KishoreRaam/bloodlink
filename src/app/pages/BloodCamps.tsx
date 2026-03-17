import { useState, useEffect } from "react";
import { Plus, MapPin, Clock, CalendarDays, Minus, Trash2, RefreshCw } from "lucide-react";
import { getCamps, createCamp, updateCamp, deleteCamp, type BloodCamp } from "../services/api";

type CampStatus = "Upcoming" | "Active" | "Completed";
type FilterTab = "All" | CampStatus;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const statusColors: Record<CampStatus, string> = {
  Upcoming:  "#D97706",
  Active:    "#16A34A",
  Completed: "#6B7280",
};

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export function BloodCamps() {
  const [filter, setFilter] = useState<FilterTab>("All");
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [capacity, setCapacity] = useState(100);
  const [targetGroups, setTargetGroups] = useState<string[]>(["A+", "B+", "O+", "AB+"]);
  const [form, setForm] = useState({
    name: "", organizer: "", venue: "", city: "", date: "",
    startTime: "", endTime: "", description: "", status: "Upcoming" as CampStatus,
  });

  function loadCamps() {
    setLoading(true);
    getCamps()
      .then(setCamps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadCamps(); }, []);

  const filtered = filter === "All" ? camps : camps.filter(c => c.status === filter);

  const toggleGroup = (g: string) =>
    setTargetGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  async function handleCreate() {
    if (!form.name.trim() || !form.date) return;
    setSubmitting(true);
    try {
      const created = await createCamp({
        name: form.name.trim(),
        organizer: form.organizer.trim() || undefined,
        camp_date: form.date,
        start_time: form.startTime || undefined,
        end_time: form.endTime || undefined,
        venue: form.venue.trim() || undefined,
        city: form.city.trim() || undefined,
        capacity,
        blood_groups: targetGroups,
        description: form.description.trim() || undefined,
        status: form.status,
      });
      setCamps(prev => [created, ...prev]);
      setForm({ name: "", organizer: "", venue: "", city: "", date: "", startTime: "", endTime: "", description: "", status: "Upcoming" });
      setCapacity(100);
      setTargetGroups(["A+", "B+", "O+", "AB+"]);
    } catch (err) {
      console.error("Failed to create camp:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(camp: BloodCamp, newStatus: CampStatus) {
    try {
      const updated = await updateCamp(camp.camp_id, { status: newStatus });
      setCamps(prev => prev.map(c => c.camp_id === camp.camp_id ? updated : c));
    } catch (err) {
      console.error("Failed to update camp:", err);
    }
  }

  async function handleDelete(campId: number) {
    try {
      await deleteCamp(campId);
      setCamps(prev => prev.filter(c => c.camp_id !== campId));
    } catch (err) {
      console.error("Failed to delete camp:", err);
    }
  }

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
          onClick={loadCamps}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#6B7280] hover:text-[#C0152A] hover:border-[#C0152A] transition-all"
          style={{ fontSize: "13px" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Camp List */}
        <div className="xl:col-span-5">
          {/* Filter Tabs */}
          <div className="flex gap-1 mb-4 bg-[#F3F4F6] dark:bg-[#1A1F2E] p-1 rounded-xl">
            {(["All", "Upcoming", "Active", "Completed"] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="flex-1 py-1.5 rounded-lg transition-all"
                style={{
                  fontSize: "12px", fontWeight: 500,
                  background: filter === tab ? "#fff" : "transparent",
                  color: filter === tab ? "#C0152A" : "#6B7280",
                  boxShadow: filter === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab}
                {tab !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({camps.filter(c => c.status === tab).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Camp Cards */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-[#F3F4F6] dark:bg-gray-800 rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F6] dark:bg-gray-800 flex items-center justify-center">
                <CalendarDays className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <p className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                No camps scheduled
              </p>
              <p className="text-[#6B7280] dark:text-gray-400 text-center" style={{ fontSize: "13px" }}>
                Use the form to create your first blood donation camp.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(camp => (
                <div
                  key={camp.camp_id}
                  className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5 hover:shadow-md dark:hover:shadow-black/20 transition-all"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#C0152A" }} />
                        <h3 className="text-[#111827] dark:text-gray-100 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                          {camp.name}
                        </h3>
                      </div>
                      {camp.organizer && (
                        <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                          Organizer: {camp.organizer}
                        </p>
                      )}
                      <p className="text-[#6B7280] dark:text-gray-400 flex items-center gap-1 mt-0.5" style={{ fontSize: "12px" }}>
                        <Clock className="w-3 h-3" />
                        {fmtDate(camp.camp_date)}
                        {camp.start_time ? ` • ${camp.start_time}${camp.end_time ? ` – ${camp.end_time}` : ""}` : ""}
                      </p>
                      {camp.venue && (
                        <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
                          📍 {camp.venue}{camp.city ? `, ${camp.city}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Status badge + actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          background: `${statusColors[camp.status]}15`,
                          color: statusColors[camp.status],
                          fontSize: "11px", fontWeight: 600,
                          border: `1px solid ${statusColors[camp.status]}33`,
                        }}
                      >
                        {camp.status === "Active" ? "● " : ""}{camp.status}
                      </span>

                      {/* Quick status change */}
                      {camp.status === "Upcoming" && (
                        <button
                          onClick={() => handleStatusChange(camp, "Active")}
                          className="text-[10px] text-[#16A34A] font-semibold hover:underline"
                        >
                          Mark Active
                        </button>
                      )}
                      {camp.status === "Active" && (
                        <button
                          onClick={() => handleStatusChange(camp, "Completed")}
                          className="text-[10px] text-[#6B7280] font-semibold hover:underline"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                      <span>Capacity: {camp.capacity}</span>
                      {camp.blood_groups.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Groups: {camp.blood_groups.join(", ")}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(camp.camp_id)}
                      className="p-1 rounded text-[#9CA3AF] hover:text-[#C0152A] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Delete camp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Create Form */}
        <div className="xl:col-span-7">
          <div
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <h2 className="text-[#111827] dark:text-white mb-5" style={{ fontSize: "16px", fontWeight: 600 }}>
              Create New Camp
            </h2>

            <div className="space-y-4">
              {[
                { label: "Camp Name *",      key: "name" as const,      placeholder: "e.g. SRM Blood Drive 2026" },
                { label: "Organizer",        key: "organizer" as const,  placeholder: "Organizer name or institution" },
                { label: "Venue / Address",  key: "venue" as const,      placeholder: "Street address" },
                { label: "City",             key: "city" as const,       placeholder: "City name" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none placeholder-[#9CA3AF]"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              ))}

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Time</label>
                  <div className="flex gap-2">
                    <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] outline-none" style={{ fontSize: "13px" }} />
                    <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] outline-none" style={{ fontSize: "13px" }} />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Status</label>
                <div className="flex rounded-lg border border-[#E5E7EB] dark:border-gray-600 overflow-hidden">
                  {(["Upcoming", "Active", "Completed"] as CampStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(p => ({ ...p, status: s }))}
                      className="flex-1 py-2 transition-all"
                      style={{
                        fontSize: "12px", fontWeight: 500,
                        background: form.status === s ? statusColors[s] : "transparent",
                        color: form.status === s ? "#fff" : "#6B7280",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity Stepper */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Max Capacity
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCapacity(c => Math.max(10, c - 10))}
                    className="w-9 h-9 rounded-lg border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-[#6B7280] hover:border-[#C0152A] hover:text-[#C0152A] transition-all">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-16 text-center text-[#111827] dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{capacity}</span>
                  <button onClick={() => setCapacity(c => Math.min(1000, c + 10))}
                    className="w-9 h-9 rounded-lg border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-[#6B7280] hover:border-[#C0152A] hover:text-[#C0152A] transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>donors</span>
                </div>
              </div>

              {/* Target Blood Groups */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Target Blood Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_GROUPS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGroup(g)}
                      className="px-3 py-1.5 rounded-full border transition-all"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "12px", fontWeight: 600,
                        borderColor: targetGroups.includes(g) ? "#C0152A" : "#E5E7EB",
                        background: targetGroups.includes(g) ? "#FDECEE" : "transparent",
                        color: targetGroups.includes(g) ? "#C0152A" : "#6B7280",
                      }}
                    >
                      {targetGroups.includes(g) ? "✓ " : ""}{g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the camp, eligibility criteria, etc."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none placeholder-[#9CA3AF] resize-none"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || !form.date || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: "#C0152A", fontSize: "14px", fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                {submitting ? "Saving…" : "Publish Camp"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
