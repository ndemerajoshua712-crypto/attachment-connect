
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading Attachment Connect...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const roleRoutes = {
      STUDENT: "/student",
      COMPANY: "/company",
      ADMIN: "/admin",
    };

    return (
      <Navigate
        to={roleRoutes[user.role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}
