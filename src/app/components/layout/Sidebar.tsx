import { NavLink, useNavigate } from "react-router";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, UserPlus, Search, AlertCircle, User,
  CalendarDays, Bell, BarChart3, Settings, LogOut,
  Droplets, Sun, Moon, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Donor Registration", icon: UserPlus, to: "/admin/register" },
  { label: "Search Donors", icon: Search, to: "/admin/search" },
  { label: "Patient Request", icon: AlertCircle, to: "/admin/request" },
];

const extendedItems = [
  { label: "Donor Profiles", icon: User, to: "/admin/profile" },
  { label: "Blood Camps", icon: CalendarDays, to: "/admin/camps" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications", badge: 3 },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
];

export function Sidebar({ onClose }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 relative group ${
      isActive
        ? "bg-[#FDECEE] text-[#C0152A] dark:bg-[#C0152A]/20 dark:text-[#ff6b7a] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-[#C0152A] before:rounded-r-full"
        : "text-[#374151] dark:text-gray-300 hover:bg-[#F3F4F6] dark:hover:bg-gray-700/50 hover:text-[#111827] dark:hover:text-white"
    }`;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] border-r border-[#E5E7EB] dark:border-gray-700/60 w-[240px]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#E5E7EB] dark:border-gray-700/60">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 bg-[#C0152A] rounded-lg flex items-center justify-center shadow-md shadow-red-900/20">
            <Droplets className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span
            className="text-[#111827] dark:text-white tracking-tight"
            style={{ fontSize: "17px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}
          >
            BloodLink
          </span>
        </button>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/admin"} className={linkClass}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="my-3 border-t border-[#E5E7EB] dark:border-gray-700/60" />

        {extendedItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-[#C0152A] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="my-3 border-t border-[#E5E7EB] dark:border-gray-700/60" />

        <NavLink to="/admin/settings" className={linkClass}>
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="border-t border-[#E5E7EB] dark:border-gray-700/60 p-3 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm text-[#6B7280] dark:text-gray-400 hover:bg-[#F3F4F6] dark:hover:bg-gray-700/50 hover:text-[#111827] dark:hover:text-white transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F9FAFB] dark:bg-gray-800/50">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "#C0152A", fontSize: "12px", fontWeight: 700 }}
          >
            {user?.name?.slice(0, 1).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#111827] dark:text-white text-sm font-semibold truncate">{user?.name ?? "User"}</p>
            <p className="text-[#6B7280] dark:text-gray-400 text-xs truncate capitalize">{user?.role ?? "staff"}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-[#6B7280] dark:text-gray-500 hover:text-[#C0152A] dark:hover:text-[#ff6b7a] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
