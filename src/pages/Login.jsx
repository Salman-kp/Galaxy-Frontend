import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; 
import EventBg from "../assets/Event.png";
import EventBgMain from "../assets/EventMain.jpg";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ADMIN_ROLES = ["admin"];
  const CAPTAIN_ROLES = ["captain"];
  const STAFF_ROLES = ["sub_captain", "main_boy", "junior_boy"];

  const validateForm = () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !password.trim()) return "Phone number and password are required.";
    if (!/^\d{10}$/.test(cleanPhone)) return "Enter a valid 10-digit phone number.";
    if (password.length < 4) return "Password must be at least 4 characters.";
    return null;
  };

 const ADMIN_NAV_ITEMS = [
    { to: "/admin/dashboard", permission: "dashboard:view" },
    { to: "/admin/users",     permission: "user:view" },
    { to: "/admin/events",    permission: "event:view" },
    { to: "/admin/wages",    permission: "managewages:view" },
    { to: "/admin/rbac",      permission: "rbac:view" },
    { to: "/admin/profile",   permission: null }, // Always the final fallback
  ];

const handleLogin = async (e) => {
  e.preventDefault();
  if (loading) return;

  setError("");
  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    setLoading(true);
    const res = await api.post("/auth/login", {
      phone: phone.trim(),
      password,
    });

    const userData = res?.data?.user;
    if (!userData || !userData.role) {
      throw new Error("Invalid response from server");
    }
    login(userData);

    if (ADMIN_ROLES.includes(userData.role)) {
        const userPermissions = userData.permissions || [];
        const firstAllowedItem = ADMIN_NAV_ITEMS.find((item) => {
        return !item.permission || userPermissions.includes(item.permission);
      });
      
      const targetPath = firstAllowedItem ? firstAllowedItem.to : "/admin/profile";
      navigate(targetPath);

    } else if (CAPTAIN_ROLES.includes(userData.role)) {
      navigate("/captain/dashboard");
    } else if (STAFF_ROLES.includes(userData.role)) {
      navigate("/staff/dashboard");
    } else {
      setError("Role not recognized for dashboard access.");
    }
  } catch (err) {
    const serverError = err?.response?.data?.error || err?.response?.data?.message;
    setError(serverError || "Invalid phone number or password.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${EventBgMain})` }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
        <div
          className="relative p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-white/70 backdrop-blur-xl lg:bg-white lg:backdrop-blur-0"
          style={{
            backgroundImage: `url(${EventBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/70 lg:bg-white" />
          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight mb-1">
              Get started now
            </h1>
            <p className="text-sm text-gray-700 mb-6 sm:mb-8">
              Sign in to continue to Galaxy Event Management
            </p>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-red-500/20 bg-red-100 px-3 py-2 text-xs sm:text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Phone number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter phone number"
                  className="w-full border-b border-black/40 bg-transparent py-2 text-sm focus:outline-none focus:border-black disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border-b border-black/40 bg-transparent py-2 text-sm focus:outline-none focus:border-black disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-black py-2.5 text-sm font-semibold text-white hover:bg-black/90 active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-5 text-xs text-gray-600">© 2026 Galaxy Event Management</p>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <img
            src={EventBg}
            alt="Event background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;