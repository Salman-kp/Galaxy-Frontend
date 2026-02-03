import { NavLink } from "react-router-dom";
import {
  Home,
  Clock,
  Calendar,
  CheckCircle,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

export default function CaptainSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("captainSidebarCollapsed") === "true";
  });

  const navItems = [
    { to: "/captain/dashboard", icon: Home, label: "Home" },
    { to: "/captain/ongoing", icon: Clock, label: "Today" }, 
    { to: "/captain/booked", icon: Calendar, label: "Booked" },
    { to: "/captain/completed", icon: CheckCircle, label: "Completed" },
    { to: "/captain/profile", icon: User, label: "Profile" },
  ];

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("captainSidebarCollapsed", next);
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
      isActive
        ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-500/30"
        : "text-gray-600 hover:bg-gray-100 hover:text-black"
    }`;

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`
          hidden md:flex h-screen bg-white border-r border-gray-100 flex-col
          flex-shrink-0
          transition-[width] duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-white">
              G
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <h1 className="text-lg font-black uppercase tracking-tight">
                  Galaxy
                </h1>
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest">
                  Captain Panel
                </span>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-black transition shrink-0"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 space-y-2 overflow-hidden">
          {!collapsed && (
            <p className="px-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Operations
            </p>
          )}

          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={22} className="shrink-0" />
              {!collapsed && (
                <span className="font-bold text-sm uppercase tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ================= MOBILE NAV ================= */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl px-2 flex justify-around items-center z-50 shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-colors duration-200 ${
                isActive
                  ? "text-red-600 bg-red-50"
                  : "text-gray-400 hover:text-black"
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold mt-1">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
