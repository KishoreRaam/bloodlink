import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Lock,
  GripVertical,
  Clock,
  Check,
  X,
  ArrowUp,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  type EmergencyItem,
  type UrgencyLevel,
  getEmergencyQueue,
  saveEmergencyQueue,
} from "./EmergencyAlertPanel";
import { getHospitals, type Hospital } from "../services/api";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_ORDER: Record<UrgencyLevel, number> = { Critical: 0, Urgent: 1, Standard: 2 };
const PAGE_SIZE = 6;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarBg(urgency: UrgencyLevel, name: string): string {
  if (urgency === "Critical") return "#991B1B";
  const colors = ["#374151", "#1F2937", "#4B5563", "#374151", "#1E3A5F"];
  return colors[name.charCodeAt(0) % colors.length];
}

function calcWaitTime(created_at: string): { text: string; color: string } {
  const mins = Math.floor((Date.now() - new Date(created_at).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const text = h > 0 ? `${h}h ${m}m` : `${m}m`;
  const color = mins > 120 ? "#DC2626" : mins > 60 ? "#EA580C" : "#6B7280";
  return { text, color };
}

const URGENCY_BORDER: Record<UrgencyLevel, string> = {
  Critical: "#DC2626",
  Urgent: "#EA580C",
  Standard: "#D1D5DB",
};

const URGENCY_BADGE: Record<UrgencyLevel, { bg: string; color: string; dot: string }> = {
  Critical: { bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
  Urgent: { bg: "#FFF7ED", color: "#EA580C", dot: "#EA580C" },
  Standard: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
};

export function PriorityQueue() {
  const [queue, setQueue] = useState<EmergencyItem[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filterGroup, setFilterGroup] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | "">("");
  const [filterHospital, setFilterHospital] = useState("");
  const [sortBy, setSortBy] = useState<"units" | "wait">("units");
  const [page, setPage] = useState(1);
  const [flashFulfill, setFlashFulfill] = useState<string | null>(null);
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  const loadQueue = () => setQueue(getEmergencyQueue());

  useEffect(() => {
    loadQueue();
    getHospitals().then(setHospitals).catch(() => {});
    window.addEventListener("emergencyQueueUpdated", loadQueue);
    return () => window.removeEventListener("emergencyQueueUpdated", loadQueue);
  }, []);

  const activeItems = queue.filter(
    (i) => i.status === "Pending" || i.status === "In Progress"
  );

  const filtered = activeItems
    .filter((i) => !filterGroup || i.blood_group === filterGroup)
    .filter((i) => !filterUrgency || i.urgency === filterUrgency)
    .filter((i) => !filterHospital || i.hospital_id === Number(filterHospital))
    .sort((a, b) => {
      const uo = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
      if (uo !== 0) return uo;
      if (sortBy === "wait")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return b.units - a.units;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const criticalCount = activeItems.filter((i) => i.urgency === "Critical").length;
  const urgentCount = activeItems.filter((i) => i.urgency === "Urgent").length;
  const standardCount = activeItems.filter((i) => i.urgency === "Standard").length;

  const updateItem = (id: string, patch: Partial<EmergencyItem>) => {
    const updated = queue.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setQueue(updated);
    saveEmergencyQueue(updated);
  };

  const handleFulfill = (id: string) => {
    setFlashFulfill(id);
    setTimeout(() => {
      updateItem(id, { status: "Fulfilled" });
      setFlashFulfill(null);
    }, 600);
  };

  const handlePromote = (id: string) => {
    updateItem(id, { urgency: "Critical" });
    setPage(1);
  };

  const handleCancel = (id: string) => {
    updateItem(id, { status: "Cancelled" });
  };

  const clearFilters = () => {
    setFilterGroup("");
    setFilterUrgency("");
    setFilterHospital("");
    setSortBy("units");
    setPage(1);
  };

  const hasFilters = !!(filterGroup || filterUrgency || filterHospital || sortBy !== "units");

  return (
    <div
      className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-[#F3F4F6] dark:border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-[#6B7280]" />
          </div>
          <div>
            <h2
              className="text-[#111827] dark:text-white font-bold"
              style={{ fontSize: "16px" }}
            >
              Priority Waiting Queue
            </h2>
            <p style={{ fontSize: "12px", color: "#6B7280" }}>
              {activeItems.length} patients waiting
              {criticalCount > 0 && (
                <span style={{ color: "#DC2626", fontWeight: 600 }}>
                  {" "}
                  · {criticalCount} critical
                </span>
              )}
              {urgentCount > 0 && (
                <span style={{ color: "#EA580C", fontWeight: 600 }}>
                  {" "}
                  · {urgentCount} urgent
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Urgency summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Critical", count: criticalCount, dot: "#DC2626", bg: "#FEF2F2", color: "#DC2626" },
            { label: "Urgent", count: urgentCount, dot: "#EA580C", bg: "#FFF7ED", color: "#EA580C" },
            { label: "Standard", count: standardCount, dot: "#9CA3AF", bg: "#F3F4F6", color: "#6B7280" },
          ].map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: b.bg,
                fontSize: "12px",
                fontWeight: 600,
                color: b.color,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: b.dot }} />
              {b.count} {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-[#F3F4F6] dark:border-gray-700/30 bg-[#F9FAFB] dark:bg-[#0D1117]/30">
        <div
          className="flex items-center gap-1.5 text-[#6B7280]"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>

        {/* Blood Group */}
        <select
          value={filterGroup}
          onChange={(e) => {
            setFilterGroup(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] dark:border-gray-600 bg-white dark:bg-[#1A1F2E] text-[#374151] dark:text-gray-300 outline-none focus:border-[#DC2626] transition-colors"
          style={{ fontSize: "12px" }}
        >
          <option value="">All Groups</option>
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Urgency pills */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#1A1F2E] border border-[#D1D5DB] dark:border-gray-600 rounded-lg p-0.5">
          {(["", "Critical", "Urgent", "Standard"] as (UrgencyLevel | "")[]).map((u) => (
            <button
              key={u || "all"}
              onClick={() => {
                setFilterUrgency(u);
                setPage(1);
              }}
              className="px-3 py-1 rounded-md font-medium transition-all"
              style={{
                fontSize: "12px",
                background:
                  filterUrgency === u
                    ? u === "Critical"
                      ? "#DC2626"
                      : u === "Urgent"
                      ? "#EA580C"
                      : u === "Standard"
                      ? "#6B7280"
                      : "#111827"
                    : "transparent",
                color: filterUrgency === u ? "#fff" : "#6B7280",
              }}
            >
              {u || "All"}
            </button>
          ))}
        </div>

        {/* Hospital */}
        <select
          value={filterHospital}
          onChange={(e) => {
            setFilterHospital(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] dark:border-gray-600 bg-white dark:bg-[#1A1F2E] text-[#374151] dark:text-gray-300 outline-none focus:border-[#DC2626] transition-colors"
          style={{ fontSize: "12px", maxWidth: "200px" }}
        >
          <option value="">All Hospitals</option>
          {hospitals.map((h) => (
            <option key={h.hospital_id} value={h.hospital_id}>
              {h.name}
            </option>
          ))}
        </select>

        {/* Sort toggle */}
        <button
          onClick={() => setSortBy((p) => (p === "units" ? "wait" : "units"))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D5DB] dark:border-gray-600 bg-white dark:bg-[#1A1F2E] text-[#374151] dark:text-gray-300 hover:border-[#DC2626] transition-colors"
          style={{ fontSize: "12px" }}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort: {sortBy === "units" ? "Units" : "Wait Time"}
        </button>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all"
            style={{ fontSize: "12px" }}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* ── Table / Empty State ── */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#9CA3AF]">
            <Inbox className="w-12 h-12 opacity-30" />
            <p style={{ fontSize: "14px" }}>
              {activeItems.length === 0
                ? "Priority queue is empty"
                : "No results match your filters"}
            </p>
            {activeItems.length > 0 && hasFilters && (
              <button
                onClick={clearFilters}
                className="text-[#DC2626] hover:underline"
                style={{ fontSize: "12px" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F3F4F6] dark:border-gray-700/30 bg-[#F9FAFB] dark:bg-transparent">
                  {["#", "PATIENT", "BLOOD GROUP", "UNITS", "HOSPITAL", "WAIT TIME", "URGENCY", "STATUS", "ACTIONS"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[#9CA3AF] dark:text-gray-500"
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginated.map((item, idx) => {
                    const wt = calcWaitTime(item.created_at);
                    const isCritical = item.urgency === "Critical";
                    const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                    const isHovered = hoverRow === item.id;
                    const isFlashing = flashFulfill === item.id;

                    return (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20, backgroundColor: "rgba(220,38,38,0.12)" }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          backgroundColor: isFlashing
                            ? "rgba(22,163,74,0.12)"
                            : isHovered
                            ? isCritical
                              ? "rgba(254,242,242,0.9)"
                              : "rgba(249,250,251,0.7)"
                            : isCritical
                            ? "rgba(254,242,242,0.4)"
                            : "transparent",
                        }}
                        exit={{ opacity: 0, x: 20, scaleY: 0 }}
                        transition={{
                          duration: 0.3,
                          layout: { type: "spring", stiffness: 300, damping: 30 },
                        }}
                        onMouseEnter={() => setHoverRow(item.id)}
                        onMouseLeave={() => setHoverRow(null)}
                        className="border-b border-[#F3F4F6] dark:border-gray-700/20"
                        style={{
                          borderLeft: `3px solid ${URGENCY_BORDER[item.urgency]}`,
                        }}
                      >
                        {/* # */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {isCritical ? (
                              <Lock className="w-3.5 h-3.5 text-[#DC2626]" />
                            ) : (
                              <GripVertical className="w-3.5 h-3.5 text-[#D1D5DB]" />
                            )}
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "#6B7280",
                              }}
                            >
                              {globalIdx}
                            </span>
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{
                                background: avatarBg(item.urgency, item.patient_name),
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(item.patient_name)}
                            </div>
                            <div>
                              <p
                                className="text-[#111827] dark:text-gray-100 font-semibold"
                                style={{ fontSize: "13px" }}
                              >
                                {item.patient_name}
                              </p>
                              {isCritical && (
                                <motion.span
                                  animate={{ opacity: [1, 0.25, 1] }}
                                  transition={{ duration: 1.1, repeat: Infinity }}
                                  className="text-[#DC2626] font-bold"
                                  style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                                >
                                  ● CRITICAL
                                </motion.span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Blood Group */}
                        <td className="px-4 py-3">
                          <BloodGroupBadge group={item.blood_group} size="sm" />
                        </td>

                        {/* Units */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[#DC2626] bg-[#FEF2F2] font-bold"
                            style={{ fontSize: "12px", minWidth: "32px" }}
                          >
                            {item.units}u
                          </span>
                        </td>

                        {/* Hospital */}
                        <td className="px-4 py-3">
                          <span
                            className="text-[#6B7280] dark:text-gray-400"
                            style={{ fontSize: "12px" }}
                          >
                            {item.hospital_name.length > 22
                              ? item.hospital_name.slice(0, 22) + "…"
                              : item.hospital_name}
                          </span>
                        </td>

                        {/* Wait Time */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Clock
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={{ color: wt.color }}
                            />
                            <span
                              style={{
                                fontSize: "12px",
                                color: wt.color,
                                fontWeight: 500,
                              }}
                            >
                              {wt.text}
                            </span>
                          </div>
                        </td>

                        {/* Urgency */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              background: URGENCY_BADGE[item.urgency].bg,
                              color: URGENCY_BADGE[item.urgency].color,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: URGENCY_BADGE[item.urgency].dot }}
                            />
                            {item.urgency}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {item.status === "In Progress" ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB]"
                              style={{ fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                              In Progress
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706]"
                              style={{ fontSize: "11px", fontWeight: 600 }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <AnimatePresence mode="wait">
                            {isHovered ? (
                              <motion.div
                                key="actions"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-1.5"
                              >
                                <button
                                  onClick={() => handleFulfill(item.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16A34A] text-white font-semibold hover:bg-[#15803D] transition-colors"
                                  style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                                >
                                  <Check className="w-3 h-3" />
                                  Fulfill
                                </button>
                                {item.urgency !== "Critical" && (
                                  <button
                                    onClick={() => handlePromote(item.id)}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors"
                                    title="Promote to Critical"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCancel(item.id)}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </motion.div>
                            ) : (
                              <motion.span
                                key="dots"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[#9CA3AF] select-none px-1"
                                style={{ fontSize: "18px", letterSpacing: "2px" }}
                              >
                                ···
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#F3F4F6] dark:border-gray-700/30">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-gray-700/50 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg font-medium transition-all"
                    style={{
                      fontSize: "13px",
                      background: page === p ? "#DC2626" : "transparent",
                      color: page === p ? "#fff" : "#6B7280",
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-gray-700/50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
