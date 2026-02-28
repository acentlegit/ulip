import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

export default function LawyerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myCases: [],
    myTasks: [],
    myHours: 0,
    billableHours: 0,
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
        <h1 style={styles.title}>Lawyer Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name}</p>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          title="My Cases"
          value={stats.myCases?.length || 0}
          icon="📁"
          color={theme.colors.primary}
          link="/cases"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.myTasks?.length || 0}
          icon="✓"
          color={theme.colors.warning}
          link="/tasks"
        />
        <StatCard
          title="Hours This Month"
          value={stats.myHours?.toFixed(1) || 0}
          icon="⏱️"
          color={theme.colors.secondary}
          link="/time-tracking"
        />
        <StatCard
          title="Billable Hours"
          value={stats.billableHours?.toFixed(1) || 0}
          icon="💰"
          color={theme.colors.success}
          link="/time-tracking"
        />
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Cases</h2>
          <div style={styles.list}>
            {stats.myCases?.slice(0, 5).map((case_) => (
              <Link key={case_.id} to={`/cases/${case_.id}`} style={styles.listItem}>
                <div>
                  <div style={styles.listItemTitle}>{case_.title}</div>
                  <div style={styles.listItemSubtitle}>{case_.client?.name}</div>
                </div>
                <div style={styles.listItemBadge}>{case_.status}</div>
              </Link>
            ))}
          </div>
          <Link to="/cases" style={styles.viewAll}>View All Cases →</Link>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Upcoming Tasks</h2>
          <div style={styles.list}>
            {stats.myTasks?.slice(0, 5).map((task) => (
              <Link key={task.id} to={`/tasks`} style={styles.listItem}>
                <div>
                  <div style={styles.listItemTitle}>{task.title}</div>
                  <div style={styles.listItemSubtitle}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </div>
                </div>
                <div style={styles.listItemBadge}>{task.priority}</div>
              </Link>
            ))}
          </div>
          <Link to="/tasks" style={styles.viewAll}>View All Tasks →</Link>
        </div>
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

const styles = {
  container: {
    padding: theme.spacing.xl,
    maxWidth: "1400px",
    margin: "0 auto",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: theme.typography.fontSize.xl,
  },
  header: {
    marginBottom: theme.spacing["2xl"],
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing["2xl"],
  },
  statCard: {
    background: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.lg,
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
  statIcon: {
    fontSize: theme.typography.fontSize["4xl"],
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: theme.spacing.xl,
  },
  section: {
    background: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
  listItemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  listItemSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  listItemBadge: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    background: theme.colors.primary,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  viewAll: {
    color: theme.colors.primary,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
};
