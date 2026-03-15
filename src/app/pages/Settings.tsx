import { useState } from "react";
import { useTheme } from "next-themes";
import {
  User, Bell, Shield, Moon, Sun, Droplets, Save, Globe, Lock, Eye, EyeOff,
} from "lucide-react";

type Tab = "Profile" | "Notifications" | "Security" | "Appearance";

const TABS: { label: Tab; icon: React.ElementType }[] = [
  { label: "Profile", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Security", icon: Shield },
  { label: "Appearance", icon: Globe },
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Dinesh",
    email: "dinesh@bloodlink.org",
    phone: "+91 98765 43210",
    role: "Admin",
    city: "Chennai",
    organisation: "BloodLink Medical Trust",
  });

  const [notifications, setNotifications] = useState({
    urgentRequests: true,
    newDonors: true,
    campReminders: true,
    weeklyReport: false,
    smsAlerts: false,
    emailDigest: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
          Settings
        </h1>
        <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
          Manage your BloodLink account preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div
          className="lg:w-[220px] flex-shrink-0 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-2 flex lg:flex-col gap-1"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", height: "fit-content" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full text-left ${
                activeTab === tab.label
                  ? "bg-[#FDECEE] text-[#C0152A] dark:bg-[#C0152A]/20 dark:text-[#ff6b7a]"
                  : "text-[#374151] dark:text-gray-400 hover:bg-[#F3F4F6] dark:hover:bg-gray-700/50"
              }`}
              style={{ fontWeight: activeTab === tab.label ? 600 : 400 }}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div
          className="flex-1 bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          {/* Profile Tab */}
          {activeTab === "Profile" && (
            <div>
              <div className="px-6 py-5 border-b border-[#E5E7EB] dark:border-gray-700/50">
                <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  Profile Information
                </h2>
                <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "13px" }}>
                  Update your personal and organisation details
                </p>
              </div>

              {/* Avatar */}
              <div className="px-6 py-5 border-b border-[#E5E7EB] dark:border-gray-700/50 flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "#C0152A", fontSize: "22px", fontWeight: 700 }}
                >
                  D
                </div>
                <div>
                  <p className="text-[#111827] dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {profile.name}
                  </p>
                  <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                    {profile.role} · {profile.organisation}
                  </p>
                  <button
                    className="mt-1.5 text-[#C0152A] dark:text-[#ff6b7a] hover:underline"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    Change avatar
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: "Full Name", key: "name" as const },
                  { label: "Email Address", key: "email" as const },
                  { label: "Phone Number", key: "phone" as const },
                  { label: "City", key: "city" as const },
                  { label: "Organisation", key: "organisation" as const },
                ].map((field) => (
                  <div key={field.key} className={field.key === "organisation" ? "sm:col-span-2" : ""}>
                    <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={profile[field.key]}
                      onChange={(e) => setProfile((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117]/50 text-[#111827] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30 focus:border-[#C0152A] transition-all"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                ))}

                {/* Role (read-only) */}
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                    Role
                  </label>
                  <div
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-[#F3F4F6] dark:bg-gray-700/30 text-[#6B7280] dark:text-gray-400"
                    style={{ fontSize: "13px" }}
                  >
                    {profile.role}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "Notifications" && (
            <div>
              <div className="px-6 py-5 border-b border-[#E5E7EB] dark:border-gray-700/50">
                <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  Notification Preferences
                </h2>
                <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "13px" }}>
                  Choose what alerts and updates you receive
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                {[
                  { key: "urgentRequests" as const, label: "Urgent Blood Requests", desc: "Get notified immediately for critical requests" },
                  { key: "newDonors" as const, label: "New Donor Registrations", desc: "Alerts when a new donor signs up" },
                  { key: "campReminders" as const, label: "Blood Camp Reminders", desc: "Reminders 24h before scheduled camps" },
                  { key: "weeklyReport" as const, label: "Weekly Summary Report", desc: "Weekly digest of BloodLink activity" },
                  { key: "smsAlerts" as const, label: "SMS Alerts", desc: "Receive critical alerts via SMS" },
                  { key: "emailDigest" as const, label: "Email Digest", desc: "Daily email digest of new activity" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#F3F4F6] dark:border-gray-700/30 last:border-0">
                    <div>
                      <p className="text-[#111827] dark:text-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>
                        {item.label}
                      </p>
                      <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                      className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
                        notifications[item.key] ? "bg-[#C0152A]" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          notifications[item.key] ? "left-5.5 translate-x-0.5" : "left-0.5"
                        }`}
                        style={{ left: notifications[item.key] ? "calc(100% - 18px)" : "2px" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "Security" && (
            <div>
              <div className="px-6 py-5 border-b border-[#E5E7EB] dark:border-gray-700/50">
                <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  Security Settings
                </h2>
                <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "13px" }}>
                  Manage your password and account access
                </p>
              </div>
              <div className="px-6 py-5 space-y-5 max-w-[440px]">
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117]/50 text-[#111827] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30 focus:border-[#C0152A] transition-all"
                      style={{ fontSize: "13px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151] dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117]/50 text-[#111827] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30 focus:border-[#C0152A] transition-all"
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117]/50 text-[#111827] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30 focus:border-[#C0152A] transition-all"
                    style={{ fontSize: "13px" }}
                  />
                </div>

                <div className="pt-2 p-4 rounded-xl bg-[#F9FAFB] dark:bg-[#0D1117]/40 border border-[#E5E7EB] dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
                    <p className="text-[#374151] dark:text-gray-300" style={{ fontSize: "12px", fontWeight: 600 }}>
                      Two-Factor Authentication
                    </p>
                  </div>
                  <p className="text-[#6B7280] dark:text-gray-400 mb-3" style={{ fontSize: "12px" }}>
                    Add an extra layer of security to your account
                  </p>
                  <button
                    className="px-4 py-2 rounded-lg border border-[#C0152A] text-[#C0152A] dark:text-[#ff6b7a] hover:bg-[#FDECEE] dark:hover:bg-[#C0152A]/10 transition-all"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "Appearance" && (
            <div>
              <div className="px-6 py-5 border-b border-[#E5E7EB] dark:border-gray-700/50">
                <h2 className="text-[#111827] dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  Appearance & Language
                </h2>
                <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "13px" }}>
                  Customise how BloodLink looks and feels
                </p>
              </div>
              <div className="px-6 py-5 space-y-6">
                {/* Theme */}
                <div>
                  <p className="text-[#374151] dark:text-gray-300 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Theme
                  </p>
                  <div className="flex gap-3">
                    {[
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Globe },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                          theme === t.value
                            ? "border-[#C0152A] bg-[#FDECEE] dark:bg-[#C0152A]/10"
                            : "border-[#E5E7EB] dark:border-gray-600 hover:border-[#C0152A]/40"
                        }`}
                      >
                        <t.icon
                          className="w-5 h-5"
                          style={{ color: theme === t.value ? "#C0152A" : "#6B7280" }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: theme === t.value ? 600 : 400,
                            color: theme === t.value ? "#C0152A" : "#6B7280",
                          }}
                        >
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent colour preview */}
                <div>
                  <p className="text-[#374151] dark:text-gray-300 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Accent Colour
                  </p>
                  <div className="flex items-center gap-3">
                    {["#C0152A", "#2563EB", "#7C3AED", "#D97706", "#16A34A"].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full transition-all ${color === "#C0152A" ? "ring-2 ring-offset-2 ring-[#C0152A]" : "hover:scale-110"}`}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                    <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "11px" }}>
                      BloodLink Red (default)
                    </span>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-[#374151] dark:text-gray-300 mb-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Language
                  </label>
                  <select
                    className="w-full max-w-[240px] px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117]/50 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30 focus:border-[#C0152A] transition-all"
                    style={{ fontSize: "13px" }}
                    defaultValue="en"
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Footer */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-gray-700/50 flex items-center justify-between bg-[#F9FAFB] dark:bg-[#0D1117]/30">
            <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
              {saved ? "✓ Changes saved successfully" : "Unsaved changes will be lost on navigation"}
            </p>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white hover:opacity-90 transition-all hover:scale-[1.02]"
              style={{ background: "#C0152A", fontSize: "13px", fontWeight: 600 }}
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
