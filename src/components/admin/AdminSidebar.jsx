import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Wallet, User, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar() {
  const { hasPermission } = useAuth();

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Overview", permission: "dashboard:view" },
    { to: "/admin/users", icon: Users, label: "Staff Members", permission: "user:view" },
    { to: "/admin/events", icon: CalendarDays, label: "Event Schedule", permission: "event:view" },
    { to: "/admin/wages", icon: Wallet, label: "Wage Mangment", permission: "managewages:view" },
    { to: "/admin/rbac", icon: ShieldCheck, label: "Access Control", permission: "rbac:view" },
    { to: "/admin/profile", icon: User, label: "My Account" },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const linkClass = ({ isActive }) =>
    `group relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" 
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 h-full bg-[#0a0a0c] flex-col p-6 border-r border-white/5">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">G</div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-none">GALAXY</h1>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Management Suite</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Main Menu</p>
          {filteredNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="font-medium text-[14px]">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 flex justify-around items-center z-50 shadow-2xl">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => 
              `p-3 rounded-xl transition-all duration-300 ${isActive ? "text-blue-500 bg-blue-500/10" : "text-gray-500 hover:text-gray-300"}`
            }
          >
            <item.icon size={22} />
          </NavLink>
        ))}
      </nav>
    </>
  );
}