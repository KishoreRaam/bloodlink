import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, AlertCircle, Droplets, CheckCircle, Info, X } from "lucide-react";
import { getDonors, getRequests, type Donor, type PatientRequest } from "../services/api";

interface Notification {
  id: string;
  type: "Urgent" | "Donor" | "Fulfillment" | "System";
  title: string;
  message: string;
  read: boolean;
  urgent?: boolean;
  link?: string;
}

const typeIcon: Record<Notification["type"], React.ReactNode> = {
  Urgent:      <AlertCircle className="w-4 h-4" style={{ color: "#C0152A" }} />,
  Donor:       <Droplets className="w-4 h-4" style={{ color: "#C0152A" }} />,
  Fulfillment: <CheckCircle className="w-4 h-4" style={{ color: "#16A34A" }} />,
  System:      <Info className="w-4 h-4" style={{ color: "#6B7280" }} />,
};

type FilterTab = "All" | Notification["type"];

const FILTER_ITEMS: { type: FilterTab; icon: string; label: string }[] = [
  { type: "All",         icon: "🔔", label: "All Notifications" },
  { type: "Urgent",      icon: "🚨", label: "Urgent Requests" },
  { type: "Donor",       icon: "🩸", label: "Donor Alerts" },
  { type: "Fulfillment", icon: "✅", label: "Fulfillments" },
  { type: "System",      icon: "ℹ️", label: "System" },
];

function buildNotifications(donors: Donor[], requests: PatientRequest[]): Notification[] {
  const notes: Notification[] = [];

  // Pending requests → Urgent
  requests
    .filter((r) => r.status === "Pending")
    .forEach((r) => {
      notes.push({
        id: `req-${r.request_id}`,
        type: "Urgent",
        title: "🚨 URGENT — Blood Needed",
        message: `${r.blood_group} blood needed at ${r.hospital_name ?? "hospital"} for patient ${r.patient_name} — ${r.quantity_needed} unit${r.quantity_needed !== 1 ? "s" : ""} required.`,
        read: false,
        urgent: true,
        link: "/admin/request",
      });
    });

  // Fulfilled requests → Fulfillment
  requests
    .filter((r) => r.status === "Fulfilled")
    .forEach((r) => {
      notes.push({
        id: `ful-${r.request_id}`,
        type: "Fulfillment",
        title: "✅ Request Fulfilled",
        message: `${r.blood_group} blood request for ${r.patient_name} at ${r.hospital_name ?? "hospital"} has been fulfilled.`,
        read: true,
        link: "/admin/request",
      });
    });

  // Available donors → Donor alerts
  donors
    .filter((d) => d.availability_status === "Available")
    .slice(0, 5)
    .forEach((d) => {
      const eligibleNow = !d.last_donated || (() => {
        const days = Math.floor((Date.now() - new Date(d.last_donated!).getTime()) / 86400000);
        return days >= 90;
      })();
      if (eligibleNow) {
        notes.push({
          id: `donor-${d.donor_id}`,
          type: "Donor",
          title: "🩸 Donor Available",
          message: `${d.name} (${d.blood_group}) from ${d.address?.split(",").slice(-1)[0]?.trim() ?? "unknown location"} is available and eligible to donate.`,
          read: true,
          link: `/admin/profile/${d.donor_id}`,
        });
      }
    });

  // System note if no data at all
  if (notes.length === 0) {
    notes.push({
      id: "sys-1",
      type: "System",
      title: "ℹ️ Welcome to BloodLink",
      message: "Register donors and create patient requests to start seeing real-time notifications here.",
      read: false,
    });
  }

  return notes;
}

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  useEffect(() => {
    Promise.all([getDonors(), getRequests()])
      .then(([donors, requests]) => {
        setNotifications(buildNotifications(donors, requests));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "All"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((ns) => ns.filter((n) => n.id !== id));

  const countByType = (type: FilterTab) =>
    type === "All"
      ? notifications.length
      : notifications.filter((n) => n.type === type).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-[#111827] dark:text-white" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: "#C0152A", fontSize: "9px", fontWeight: 700 }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
              Notifications
            </h1>
            <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "14px" }}>
              {loading ? "Loading…" : `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-3">
          <div
            className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-3 sticky top-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            {FILTER_ITEMS.map((item, i) => (
              <div key={item.type}>
                {i === 1 && <div className="my-2 border-t border-[#E5E7EB] dark:border-gray-700/50" />}
                <button
                  onClick={() => setActiveFilter(item.type)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                  style={{
                    background: activeFilter === item.type ? "#FDECEE" : "transparent",
                    borderLeft: activeFilter === item.type ? "2px solid #C0152A" : "2px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{item.icon}</span>
                  <span
                    className="flex-1"
                    style={{
                      fontSize: "13px",
                      fontWeight: activeFilter === item.type ? 600 : 400,
                      color: activeFilter === item.type ? "#C0152A" : "#374151",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: activeFilter === item.type ? "#C0152A" : "#F3F4F6",
                      color: activeFilter === item.type ? "#fff" : "#6B7280",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {countByType(item.type)}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-9 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
              Loading notifications…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[#F3F4F6] dark:bg-gray-800">
                <Bell className="w-10 h-10 text-[#9CA3AF]" />
              </div>
              <h3 className="text-[#111827] dark:text-white mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>
                You're all caught up!
              </h3>
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "14px" }}>
                No notifications in this category.
              </p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-[12px] border p-5 transition-all hover:shadow-md dark:hover:shadow-black/20 ${
                  notif.urgent
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50"
                    : !notif.read
                    ? "bg-[#FDECEE]/60 dark:bg-[#C0152A]/5 border-[#C0152A]/30"
                    : "bg-white dark:bg-[#1A1F2E] border-[#E5E7EB] dark:border-gray-700/50"
                }`}
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor: notif.urgent ? "#C0152A" : !notif.read ? "#C0152A" : "transparent",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {typeIcon[notif.type]}
                    <span
                      className={notif.urgent ? "text-[#C0152A]" : "text-[#111827] dark:text-white"}
                      style={{ fontSize: "13px", fontWeight: 700 }}
                    >
                      {notif.title}
                      {notif.urgent && (
                        <span
                          className="ml-2 inline-block w-2 h-2 rounded-full animate-pulse"
                          style={{ background: "#C0152A", verticalAlign: "middle" }}
                        />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#C0152A" }} />
                    )}
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="p-0.5 rounded text-[#9CA3AF] hover:text-[#C0152A] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[#374151] dark:text-gray-300 mb-3" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                  {notif.message}
                </p>

                {notif.link && (
                  <button
                    onClick={() => navigate(notif.link!)}
                    className="px-4 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ background: "#C0152A", fontSize: "12px", fontWeight: 500 }}
                  >
                    {notif.urgent ? "View Matching Donors" : "View Details"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
