import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    revenue: 0,
    pendingRevenue: 0,
    overdueAmount: 0,
    invoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Finance Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name}</p>
      </div>

      <div style={styles.statsGrid}>
        <StatCard title="Total Revenue" value={`$${stats.revenue?.toLocaleString() || 0}`} icon="💰" color={theme.colors.success} link="/invoices" />
        <StatCard title="Pending Revenue" value={`$${stats.pendingRevenue?.toLocaleString() || 0}`} icon="⏳" color={theme.colors.warning} link="/invoices" />
        <StatCard title="Overdue Amount" value={`$${stats.overdueAmount?.toLocaleString() || 0}`} icon="⚠️" color={theme.colors.error} link="/invoices" />
        <StatCard title="Active Invoices" value={stats.invoices} icon="📄" color={theme.colors.info} link="/invoices" />
      </div>

      <div style={styles.actionsGrid}>
        <QuickAction title="Create Invoice" icon="➕" link="/invoices/new" />
        <QuickAction title="Time Entries" icon="⏱️" link="/time-tracking" />
        <QuickAction title="Financial Reports" icon="📊" link="/reports" />
        <QuickAction title="Payment Tracking" icon="💳" link="/invoices" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, link }) {
  return (
    <Link to={link} style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statContent}>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statTitle}>{title}</div>
      </div>
    </Link>
  );
}

function QuickAction({ title, icon, link }) {
  return (
    <Link to={link} style={styles.actionCard}>
      <div style={styles.actionIcon}>{icon}</div>
      <div style={styles.actionTitle}>{title}</div>
    </Link>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1400px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { marginBottom: theme.spacing["2xl"] },
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: theme.spacing.lg, marginBottom: theme.spacing["2xl"] },
  statCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, display: "flex", alignItems: "center", gap: theme.spacing.lg, textDecoration: "none", transition: theme.transitions.fast },
  statIcon: { fontSize: theme.typography.fontSize["4xl"] },
  statContent: { flex: 1 },
  statValue: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  statTitle: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: theme.spacing.lg },
  actionCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textAlign: "center", textDecoration: "none", transition: theme.transitions.fast },
  actionIcon: { fontSize: theme.typography.fontSize["4xl"], marginBottom: theme.spacing.md },
  actionTitle: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textPrimary },
};
