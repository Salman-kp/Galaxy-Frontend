import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import EventManagement from "../pages/admin/EventManagement";
import RoleWageManagement from "../pages/admin/RoleWageManagement";
import AdminProfile from "../pages/admin/AdminProfile";
import EventDetails from "../pages/admin/EventDetails";
import RBACManagement from "../pages/admin/RBACManagement";

function AppRoutes() {
  const { isAuthenticated, role, hasPermission, loading } = useAuth();
  if (loading) {
    return <div className="h-screen flex items-center justify-center font-bold">Loading Galaxy...</div>;
  }

  const getRedirectPath = () => {
    if (role === "admin") {
      if (hasPermission("dashboard:view")) return "/admin/dashboard";
      if (hasPermission("user:view"))      return "/admin/users";
      if (hasPermission("event:view"))     return "/admin/events";
      if (hasPermission("rbac:view"))      return "/admin/rbac";
      if (hasPermission("managewages:view")) return "/admin/wages";
      return "/admin/profile";
    }
    if (role === "captain") return "/captain/dashboard";
    return "/staff/dashboard";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Login />} 
        />

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={hasPermission("dashboard:view") ? <AdminDashboard /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/users" element={hasPermission("user:view") ? <UserManagement /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/events" element={hasPermission("event:view") ? <EventManagement /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/events/:id" element={hasPermission("event:view") ? <EventDetails /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/rbac" element={hasPermission("rbac:view") ? <RBACManagement/> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/wages" element={hasPermission("managewages:view") ? <RoleWageManagement /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* OTHER ROLES */}
        <Route element={<ProtectedRoute allowedRoles={["captain"]} />}>
          <Route path="/captain/dashboard" element={<div>Captain Dashboard</div>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["sub_captain", "main_boy", "junior_boy"]} />}>
          <Route path="/staff/dashboard" element={<div>Staff Dashboard</div>} />
        </Route>

        {/* ROOT REDIRECT */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Navigate to="/login" replace />} 
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;