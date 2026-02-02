import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="absolute top-0 right-0 left-0 h-20 flex items-center justify-end px-8 bg-white/5 backdrop-blur-md border-b border-white/10 z-70 transition-all">
      <div className="flex items-center gap-6">
        
        {/* USER INFO */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-extrabold  text-white leading-none">
              {user?.name}
            </p>
          </div>
          {/* LOGOUT BUTTON */}
          <button 
            onClick={logout}
            title="Logout"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/40 border border-white/50 text-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-sm active:scale-90"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </header>
  );
}