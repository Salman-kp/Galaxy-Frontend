import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("galaxy_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("galaxy_user");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (userData) => {
    localStorage.setItem("galaxy_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("galaxy_user");
      setUser(null);
      window.location.href = "/login";
    }
  };

  const value = { user, isAuthenticated: !!user, role: user?.role || null, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {/* Prevents route flickering during storage check */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};