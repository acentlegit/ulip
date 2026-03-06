import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function CaseAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [case_, setCase] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalHours: 0,
    totalExpenses: 0,
    totalBilled: 0,
    taskCompletion: 0,
    documentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(getApiUrl("cases/${id}"));
      setCase(res.data);
      
      const timeEntries = res.data.timeEntries || [];
      const expenses = res.data.expenses || [];
      const invoices = res.data.invoices || [];
      const tasks = res.data.tasks || [];
      const documents = res.data.documents || [];

      setAnalytics({
        totalHours: timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0),
        totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        totalBilled: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
        taskCompletion: tasks.length > 0 
          ? (tasks.filter(t => t.status === "COMPLETED").length / tasks.length) * 100 
          : 0,
        documentCount: documents.length,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading analytics...</div>;
  if (!case_) return <div>Case not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/cases/${id}`)} style={styles.backButton}>
          ← Back to Case
        </button>
        <h1 style={styles.title}>Case Analytics</h1>
        <p style={styles.subtitle}>{case_.title}</p>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard title="Total Hours" value={analytics.totalHours.toFixed(2)} icon="⏱️" />
        <MetricCard title="Total Expenses" value={`$${analytics.totalExpenses.toFixed(2)}`} icon="💰" />
        <MetricCard title="Total Billed" value={`$${analytics.totalBilled.toFixed(2)}`} icon="💵" />
        <MetricCard title="Task Completion" value={`${analytics.taskCompletion.toFixed(0)}%`} icon="✓" />
        <MetricCard title="Documents" value={analytics.documentCount} icon="📄" />
        <MetricCard title="Status" value={case_.status} icon="📊" />
      </div>

      <div style={styles.charts}>
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>Time Tracking</h2>
          <p style={styles.chartPlaceholder}>Chart visualization coming soon...</p>
        </div>
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>Expense Breakdown</h2>
          <p style={styles.chartPlaceholder}>Chart visualization coming soon...</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricIcon}>{icon}</div>
      <div style={styles.metricContent}>
        <div style={styles.metricValue}>{value}</div>
        <div style={styles.metricTitle}>{title}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1400px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { marginBottom: theme.spacing["2xl"] },
  backButton: { background: "none", border: "none", color: theme.colors.primary, cursor: "pointer", fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing.md, padding: 0 },
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.xs, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: theme.spacing.lg, marginBottom: theme.spacing["2xl"] },
  metricCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, display: "flex", alignItems: "center", gap: theme.spacing.lg },
  metricIcon: { fontSize: theme.typography.fontSize["4xl"] },
  metricContent: { flex: 1 },
  metricValue: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  metricTitle: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  charts: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: theme.spacing.xl },
  chartCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, minHeight: "300px" },
  chartTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  chartPlaceholder: { color: theme.colors.textSecondary, textAlign: "center", padding: theme.spacing["2xl"] },
};
