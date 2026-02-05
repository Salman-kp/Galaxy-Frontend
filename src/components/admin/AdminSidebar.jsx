import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  User,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ComputerIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar() {
  const { hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Overview", permission: "dashboard:view" },
    { to: "/admin/users", icon: Users, label: "Staff Members", permission: "user:view" },
    { to: "/admin/events", icon: CalendarDays, label: "Event Schedule", permission: "event:view" },
    { to: "/admin/wages", icon: Wallet, label: "Wage Management", permission: "managewages:view" },
    { to: "/admin/settings", icon: ComputerIcon,  label: "System Management", permission: "system:manage" },
    { to: "/admin/rbac", icon: ShieldCheck, label: "Access Control", permission: "rbac:view" },
    { to: "/admin/profile", icon: User, label: "My Account" },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`hidden md:flex h-screen bg-[#0a0a0c] flex-col border-r border-white/5 transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              G
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white leading-none">
                  GALAXY
                </h1>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Management Suite
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-white transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2">
          {!collapsed && (
            <p className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">
              Main Menu
            </p>
          )}

          {filteredNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={20} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 flex justify-around items-center z-50 shadow-2xl">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `p-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-blue-500 bg-blue-500/10"
                  : "text-gray-500 hover:text-gray-300"
              }`
            }
          >
            <item.icon size={22} />
          </NavLink>
        ))}
      </nav>
    </>
  );
}
