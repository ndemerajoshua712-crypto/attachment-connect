
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  FileText,
  BriefcaseBusiness,
  ClipboardList,
  Settings,
  Bell,
  Menu,
  X,
  GraduationCap,
  LogOut,
  Building2,
  ShieldCheck,
  Users,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api";

const portalConfig = {
  STUDENT: {
    title: "Student Portal",
    links: [
      { label: "Overview", path: "dashboard", icon: LayoutDashboard },
      { label: "My Profile", path: "profile", icon: UserRound },
      { label: "My CV", path: "cv", icon: FileText },
      { label: "Opportunities", path: "opportunities", icon: BriefcaseBusiness },
      { label: "Applications", path: "applications", icon: ClipboardList },
      { label: "Settings", path: "settings", icon: Settings },
    ],
  },

  COMPANY: {
    title: "Company Portal",
    links: [
      { label: "Overview", path: "dashboard", icon: LayoutDashboard },
      { label: "Company Profile", path: "profile", icon: Building2 },
      { label: "My Opportunities", path: "opportunities", icon: BriefcaseBusiness },
      { label: "Applicants", path: "applicants", icon: Users },
      { label: "Settings", path: "settings", icon: Settings },
    ],
  },

  ADMIN: {
    title: "Administration",
    links: [
      { label: "Overview", path: "dashboard", icon: LayoutDashboard },
      { label: "Users", path: "users", icon: Users },
      { label: "Companies", path: "companies", icon: Building2 },
      { label: "Verifications", path: "verifications", icon: CheckCircle },
      { label: "Opportunities", path: "opportunities", icon: BriefcaseBusiness },
      { label: "Settings", path: "settings", icon: Settings },
    ],
  },
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [photo, setPhoto] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(()=>{(async()=>{try{if(role==="STUDENT"){const p=await apiRequest("/students/me");setPhoto(p.profile.profilePhoto||"");}else if(role==="COMPANY"){const p=await apiRequest("/companies/profile");setPhoto(p.company.logoStorageKey||"");}const n=await apiRequest("/notifications");setNotifications(n.notifications||[]);}catch{}})();},[role]);

  const config = portalConfig[role];

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (!config) return null;

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            {role === "STUDENT" ? (
              <GraduationCap size={25} />
            ) : role === "COMPANY" ? (
              <Building2 size={25} />
            ) : (
              <ShieldCheck size={25} />
            )}
          </div>

          <div>
            <h2>Attachment<span>Connect</span></h2>
            <p>{config.title}</p>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <p className="nav-heading">WORKSPACE</p>

          <nav className="sidebar-nav">
            {config.links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-footer">
            <div className="avatar">
              {(user?.email || "U").charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user">
              <strong>{user?.email || "Account"}</strong>
              <span>{config.title}</span>
            </div>

            <button
              className="settings-button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>{config.title}</span>
              <span>/</span>
              <strong>Workspace</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
              onClick={()=>setShowNotifications(v=>!v)}
            >
              <Bell size={20} />
              {notifications.some(n=>!n.readAt)&&<span className="notification-dot"/>}
            </button>
            <div className="topbar-account"><img src={photo?`http://localhost:5000/uploads/${photo}`:undefined} alt="" onError={e=>e.currentTarget.style.display="none"}/><span>{user?.email?.split("@")[0]||"Account"}</span></div>
            {showNotifications&&<div className="notification-panel"><strong>Notifications</strong>{notifications.length?notifications.map(n=><button key={n.id} className={n.readAt?"read":"unread"} onClick={async()=>{if(!n.readAt){await apiRequest(`/notifications/${n.id}/read`,{method:"PATCH"});setNotifications(items=>items.map(x=>x.id===n.id?{...x,readAt:new Date().toISOString()}:x));}}}><b>{n.title}</b><span>{n.message}</span><small>{new Date(n.createdAt).toLocaleDateString()}</small></button>):<p>No notifications yet.</p>}</div>}
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
