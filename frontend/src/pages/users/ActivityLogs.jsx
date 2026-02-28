import { useState, useEffect } from "react";
import axios from "axios";
import { theme } from "../../styles/theme";
import { formatRole } from "../../constants/roles";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/audit-logs", { params: filters });
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading activity logs...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Activity Logs</h1>
        <p style={styles.subtitle}>Track all system activities and user actions</p>
      </div>

      <div style={styles.filters}>
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="VIEW">View</option>
          <option value="LOGIN">Login</option>
        </select>
        <select
          value={filters.entityType}
          onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Entities</option>
          <option value="CASE">Case</option>
          <option value="CLIENT">Client</option>
          <option value="DOCUMENT">Document</option>
          <option value="USER">User</option>
        </select>
        <button onClick={fetchLogs} style={styles.filterButton}>
          Apply Filters
        </button>
      </div>

      <div style={styles.logsList}>
        {logs.map((log) => (
          <div key={log.id} style={styles.logCard}>
            <div style={styles.logHeader}>
              <div style={styles.logAction}>{log.action}</div>
              <div style={styles.logEntity}>{log.entityType}</div>
              <div style={styles.logDate}>
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
            <div style={styles.logDetails}>
              <div style={styles.logUser}>
                User: {log.user?.name || "System"} ({formatRole(log.user?.role || "")})
              </div>
              {log.details && (
                <div style={styles.logDetailsText}>{log.details}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1400px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { marginBottom: theme.spacing.xl },
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary },
  filters: { display: "flex", gap: theme.spacing.md, marginBottom: theme.spacing.xl, flexWrap: "wrap" },
  filterSelect: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
  filterButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  logsList: { display: "flex", flexDirection: "column", gap: theme.spacing.md },
  logCard: { background: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  logHeader: { display: "flex", gap: theme.spacing.md, alignItems: "center", marginBottom: theme.spacing.md, flexWrap: "wrap" },
  logAction: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  logEntity: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.secondary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  logDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textTertiary, marginLeft: "auto" },
  logDetails: { display: "flex", flexDirection: "column", gap: theme.spacing.xs },
  logUser: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  logDetailsText: { fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary, marginTop: theme.spacing.sm, padding: theme.spacing.md, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md },
};
