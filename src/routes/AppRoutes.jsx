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
import CaptainLayout from "../layouts/CaptainLayout";
import CaptainDashboard from "../pages/captain/CaptainDashboard";
import OngoingEvents from "../pages/captain/OngoingEvents";
import BookedEvents from "../pages/captain/BookedEvents";
import CompletedEvents from "../pages/captain/CompletedEvents";
import CaptainProfile from "../pages/captain/CaptainProfile";
import BookingPage from "../pages/captain/BookingPage";
import CaptainEventDetails from "../pages/captain/CaptainEventDetails";
import WorkersProfile from "../pages/workers/WorkersProfile";
import WorkersLayout from "../layouts/WorkersLayout";
import WorkersDashboard from "../pages/workers/WorkersDashboard";
import WorkersBookingPage from "../pages/workers/WorkersBookingPage";
import WorkersEventDetails from "../pages/workers/WorkersEventDetails";
import WorkersBookedEvents from "../pages/workers/WorkersBookedEvents";
import WorkersCompletedEvents from "../pages/workers/WorkersCompletedEvents";
import SystemConfig from "../pages/admin/SystemConfig";

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
      if (hasPermission("system:manage")) return "/admin/settings";
      if (hasPermission("managewages:view")) return "/admin/wages";
      return "/admin/profile";
    }
    if (role === "captain") return "/captain/dashboard";
    return "/worker/dashboard";
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
            <Route path="/admin/settings" element={hasPermission("system:manage") ? <SystemConfig /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/dashboard" element={hasPermission("dashboard:view") ? <AdminDashboard /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/users" element={hasPermission("user:view") ? <UserManagement /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/events" element={hasPermission("event:view") ? <EventManagement /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/events/:id" element={hasPermission("event:view") ? <EventDetails /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/rbac" element={hasPermission("rbac:view") ? <RBACManagement/> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/wages" element={hasPermission("managewages:view") ? <RoleWageManagement /> : <Navigate to={getRedirectPath()} replace />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

       {/* CAPTAIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["captain"]} />}>
          <Route element={<CaptainLayout />}>
            <Route path="/captain/dashboard" element={<CaptainDashboard />} />
            <Route path="/captain/book/:id" element={<BookingPage />} />
            <Route path="/captain/events/:id" element={<CaptainEventDetails />} />
            <Route path="/captain/ongoing" element={<OngoingEvents />} />
            <Route path="/captain/booked" element={<BookedEvents />} />
            <Route path="/captain/completed" element={<CompletedEvents />} />
            <Route path="/captain/profile" element={<CaptainProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["sub_captain", "main_boy", "junior_boy"]} />}>
          <Route element={<WorkersLayout />}>
            <Route path="/worker/dashboard" element={<WorkersDashboard />} />
            <Route path="/worker/book/:id" element={<WorkersBookingPage />} />
            <Route path="/worker/event/:id" element={<WorkersEventDetails />} />
            <Route path="/worker/booked-events" element={<WorkersBookedEvents />} />
            <Route path="/worker/completed-events" element={<WorkersCompletedEvents />} />
            <Route path="/worker/profile" element={<WorkersProfile />} />
          </Route>
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