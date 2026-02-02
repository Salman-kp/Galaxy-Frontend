import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const {loading, isAuthenticated, role } = useAuth(); 

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

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'captain') return <Navigate to="/captain/dashboard" replace />;
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;