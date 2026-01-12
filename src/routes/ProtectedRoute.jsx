import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  // DEBUG: Check what the app sees when you try to access the route
  console.log("Auth State:", { isAuthenticated, role: user?.role, loading });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-gray-400">
        Loading Auth...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn("Access Denied: Role mismatch");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;