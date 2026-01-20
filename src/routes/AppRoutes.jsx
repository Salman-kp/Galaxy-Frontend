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

function AppRoutes() {
  const { isAuthenticated, role, loading } = useAuth();

  // 1. IMPORTANT: Prevent redirect loops while loading auth state
  if (loading) {
    return <div className="h-screen flex items-center justify-center font-bold">Loading Galaxy...</div>;
  }

  const getRedirectPath = (userRole) => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "captain") return "/captain/dashboard";
    return "/staff/dashboard";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getRedirectPath(role)} replace /> : <Login />} 
        />

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/events" element={<EventManagement />} />
            <Route path="/admin/events/:id" element={<EventDetails />} />
            <Route path="/admin/wages" element={<RoleWageManagement/>} />
            <Route path="/admin/profile" element={<AdminProfile/>} />
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
          element={isAuthenticated ? <Navigate to={getRedirectPath(role)} replace /> : <Navigate to="/login" replace />} 
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;