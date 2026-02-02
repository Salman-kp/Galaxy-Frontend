import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem("galaxy_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            ...parsedUser,
            permissions: parsedUser.permissions || []
          });
        } catch (e) {
          localStorage.removeItem("galaxy_user");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (userData) => {
    const userToStore = {
      id: userData.id,
      name: userData.name,
      role: userData.role,
    };

    if (userData.permissions && Array.isArray(userData.permissions) && userData.permissions.length > 0) {
      userToStore.permissions = userData.permissions;
    }

    localStorage.setItem("galaxy_user", JSON.stringify(userToStore));
    
    setUser({
      ...userToStore,
      permissions: userToStore.permissions || []
    });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("galaxy_user");
      setUser(null);
      window.location.replace("/login");
    }
  };

  const hasPermission = useCallback((permissionSlug) => {
    return user?.permissions?.includes(permissionSlug) || false;
  }, [user]);

  const value = { 
    user, 
    isAuthenticated: !!user, 
    role: user?.role || null, 
    permissions: user?.permissions || [],
    hasPermission,
    login, 
    logout, 
    loading 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};