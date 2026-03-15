import { useState } from "react";
import { Bell, AlertCircle, Droplets, Calendar, CheckCircle, Info, X, Settings } from "lucide-react";

type NotifType = "All" | "Urgent" | "Donor" | "Camp" | "Fulfillment" | "System";

interface Notification {
  id: string;
  type: "Urgent" | "Donor" | "Camp" | "Fulfillment" | "System";
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
  actions?: { label: string; primary?: boolean }[];
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "Urgent", title: "🚨 URGENT",
    message: "O- blood needed at Apollo Hospital, Chennai — Patient: Emergency Surgery • 2 units required",
    time: "2 mins ago", read: false, urgent: true,
    actions: [{ label: "View Matching Donors", primary: true }, { label: "Dismiss" }],
  },
  {
    id: "n2", type: "Urgent", title: "🚨 URGENT",
    message: "AB- blood needed at AIIMS Delhi — Patient: Cardiac Surgery • 3 units required",
    time: "15 mins ago", read: false, urgent: true,
    actions: [{ label: "View Matching Donors", primary: true }, { label: "Dismiss" }],
  },
  {
    id: "n3", type: "Donor", title: "🩸 You're eligible to donate again!",
    message: "It's been 90 days since your last donation. Your contribution can save up to 3 lives.",
    time: "1 hour ago", read: false,
    actions: [{ label: "Find a Camp Near Me", primary: true }],
  },
  {
    id: "n4", type: "Camp", title: "📅 Camp Tomorrow: SRM Blood Drive",
    message: "March 22 • 9:00 AM – 5:00 PM • Kattankulathur, Chennai. 47/100 registered.",
    time: "6 hours ago", read: true,
    actions: [{ label: "View Details" }, { label: "Add to Calendar" }],
  },
  {
    id: "n5", type: "Fulfillment", title: "✅ Request Fulfilled",
    message: "O+ blood request for patient Kavya Reddy at Apollo Hospital has been fulfilled. 2 donors responded.",
    time: "8 hours ago", read: true,
  },
  {
    id: "n6", type: "Donor", title: "🩸 New Donor Registered",
    message: "Vikram Singh (B-) from Salem has joined the donor network and is available to donate.",
    time: "12 hours ago", read: true,
  },
  {
    id: "n7", type: "Fulfillment", title: "✅ Emergency Request Resolved",
    message: "Emergency B+ request at Fortis Hospital resolved. Patient received 1 unit from donor Rahul Kumar.",
    time: "1 day ago", read: true,
  },
  {
    id: "n8", type: "System", title: "ℹ️ System Update",
    message: "BloodLink v2.1 released — Improved donor matching algorithm and new analytics dashboard.",
    time: "2 days ago", read: true,
  },
  {
    id: "n9", type: "Urgent", title: "🚨 URGENT",
    message: "A- blood urgently needed at Manipal Hospital — 1 unit for pediatric surgery",
    time: "2 days ago", read: true, urgent: true,
    actions: [{ label: "View Matching Donors", primary: true }],
  },
];

const FILTER_ITEMS: { type: NotifType; icon: string; label: string; count: number }[] = [
  { type: "All", icon: "🔔", label: "All Notifications", count: 24 },
  { type: "Urgent", icon: "🚨", label: "Urgent Requests", count: 3 },
  { type: "Donor", icon: "🩸", label: "Donor Alerts", count: 8 },
  { type: "Camp", icon: "📅", label: "Camp Reminders", count: 5 },
  { type: "Fulfillment", icon: "✅", label: "Fulfillments", count: 6 },
  { type: "System", icon: "ℹ️", label: "System", count: 2 },
];

const typeIcon: Record<Notification["type"], React.ReactNode> = {
  Urgent: <AlertCircle className="w-4 h-4" style={{ color: "#C0152A" }} />,
  Donor: <Droplets className="w-4 h-4" style={{ color: "#C0152A" }} />,
  Camp: <Calendar className="w-4 h-4" style={{ color: "#D97706" }} />,
  Fulfillment: <CheckCircle className="w-4 h-4" style={{ color: "#16A34A" }} />,
  System: <Info className="w-4 h-4" style={{ color: "#6B7280" }} />,
};

export function Notifications() {
  const [activeFilter, setActiveFilter] = useState<NotifType>("All");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const filtered = activeFilter === "All"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((ns) => ns.filter((n) => n.id !== id));

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
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filter Sidebar */}
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
                    {item.count}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Notification Feed */}
        <div className="lg:col-span-9 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[#F3F4F6] dark:bg-gray-800">
                <Bell className="w-10 h-10 text-[#9CA3AF]" />
              </div>
              <h3 className="text-[#111827] dark:text-white mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>
                You're all caught up!
              </h3>
              <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "14px" }}>
                No new notifications right now.
              </p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-[12px] border p-5 transition-all hover:shadow-md dark:hover:shadow-black/20 ${
                  notif.urgent
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50"
                    : !notif.read
                    ? "bg-[#FDECEE]/60 dark:bg-[#C0152A]/5 border-[#C0152A]/30 dark:border-[#C0152A]/20"
                    : "bg-white dark:bg-[#1A1F2E] border-[#E5E7EB] dark:border-gray-700/50"
                }`}
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor: notif.urgent ? "#F59E0B" : !notif.read ? "#C0152A" : "transparent",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                {/* Notification Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {typeIcon[notif.type]}
                    <span
                      className={`${notif.urgent ? "text-[#C0152A]" : "text-[#111827] dark:text-white"}`}
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
                    <span className="text-[#9CA3AF]" style={{ fontSize: "11px" }}>
                      {notif.time}
                    </span>
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

                <p
                  className="text-[#374151] dark:text-gray-300 mb-3"
                  style={{ fontSize: "13px", lineHeight: 1.6 }}
                >
                  {notif.message}
                </p>

                {notif.actions && (
                  <div className="flex flex-wrap gap-2">
                    {notif.actions.map((action) => (
                      <button
                        key={action.label}
                        className="px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
                        style={{
                          background: action.primary ? "#C0152A" : "transparent",
                          color: action.primary ? "#fff" : "#6B7280",
                          border: action.primary ? "none" : "1px solid #E5E7EB",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
