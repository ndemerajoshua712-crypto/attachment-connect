
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import PortalPage from "./pages/PortalPage";
import StudentProfile from "./pages/StudentProfile";
import StudentCVs from "./pages/StudentCVs";

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Loading Attachment Connect...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const destinations = {
    STUDENT: "/student",
    COMPANY: "/company",
    ADMIN: "/admin",
  };

  return (
    <Navigate
      to={destinations[user.role] || "/login"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* STUDENT PORTAL */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route
          path="/student"
          element={<DashboardLayout role="STUDENT" />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="cv" element={<StudentCVs />} />
          <Route path=":section" element={<PortalPage />} />
        </Route>
      </Route>

      {/* COMPANY PORTAL */}
      <Route element={<ProtectedRoute allowedRoles={["COMPANY"]} />}>
        <Route
          path="/company"
          element={<DashboardLayout role="COMPANY" />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path=":section" element={<PortalPage />} />
        </Route>
      </Route>

      {/* ADMIN PORTAL */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route
          path="/admin"
          element={<DashboardLayout role="ADMIN" />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path=":section" element={<PortalPage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
