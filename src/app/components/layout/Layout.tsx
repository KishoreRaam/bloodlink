import { Outlet, Navigate } from "react-router";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const initials = user?.name?.slice(0, 1).toUpperCase() ?? "?";

  return (
    <div className="flex h-screen bg-[#F3F4F6] dark:bg-[#0D1117] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-gray-700/60">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#6B7280] dark:text-gray-400 hover:bg-[#F3F4F6] dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#C0152A] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">BL</span>
            </div>
            <span className="text-[#111827] dark:text-white font-bold text-base">BloodLink</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#C0152A] flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ pointerEvents: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
