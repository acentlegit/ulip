import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRoles, isAdminRole, formatRole } from "../constants/roles";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/cases", label: "Cases", icon: "📁" },
    { path: "/clients", label: "Clients", icon: "👥" },
    { path: "/documents", label: "Documents", icon: "📄" },
    { path: "/tasks", label: "Tasks", icon: "✓" },
    { path: "/calendar", label: "Calendar", icon: "📅" },
    { path: "/time-tracking", label: "Time Tracking", icon: "⏱️" },
    { path: "/invoices", label: "Invoices", icon: "💰" },
    { path: "/reports", label: "Reports", icon: "📈" },
    { path: "/predictive-analysis", label: "Predictive Analysis", icon: "🤖" }
  ];

  // Show Users menu only for admin roles
  if (isAdminRole(user?.role)) {
    menuItems.push({ path: "/users", label: "Users", icon: "👤" });
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, width: sidebarOpen ? "250px" : "70px" }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen && <h2 style={styles.logo}>ELMP</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>
              {menuItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name}</span>
              <span style={styles.userRole}>{formatRole(user?.role)}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  sidebar: {
    background: "#1a1a2e",
    color: "white",
    transition: "width 0.3s",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  sidebarHeader: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #2a2a3e"
  },
  logo: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "#667eea"
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    padding: "5px 10px"
  },
  nav: {
    flex: 1,
    padding: "20px 0"
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    color: "#ccc",
    textDecoration: "none",
    transition: "all 0.2s",
    borderLeft: "3px solid transparent"
  },
  navItemActive: {
    background: "#2a2a3e",
    color: "#667eea",
    borderLeft: "3px solid #667eea"
  },
  navIcon: {
    fontSize: "20px",
    width: "24px",
    textAlign: "center"
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    background: "white",
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  headerLeft: {
    flex: 1
  },
  pageTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
    color: "#333"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  userRole: {
    fontSize: "12px",
    color: "#666",
    textTransform: "capitalize"
  },
  logoutBtn: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  content: {
    flex: 1,
    padding: "30px",
    overflow: "auto"
  }
};
