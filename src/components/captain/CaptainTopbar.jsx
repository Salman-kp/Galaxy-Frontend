import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CaptainTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="absolute top-0 right-0 left-0 h-20 flex items-center justify-between px-6 bg-white/5 backdrop-blur-md border-b border-white/10 z-70 transition-all">
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-black italic text-red-600 uppercase truncate max-w-[120px] sm:max-w-[200px]">
          {user?.name}
        </p>
        <span className="text-gray-300 ">|</span> 
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          {user?.role}
        </p>
      </div>
      <button 
        onClick={logout}
        title="Logout"
        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/40 border border-gray-400 text-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-sm active:scale-90">
        <LogOut size={18} strokeWidth={2.5} />
      </button>
    </header>
  );
}