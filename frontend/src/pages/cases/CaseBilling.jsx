import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function CaseBilling() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billing, setBilling] = useState({ timeEntries: [], expenses: [], invoices: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBilling();
  }, [id]);

  const fetchBilling = async () => {
    try {
      const res = await axios.get(getApiUrl("cases/${id}"));
      setBilling({
        timeEntries: res.data.timeEntries || [],
        expenses: res.data.expenses || [],
        invoices: res.data.invoices || [],
      });
    } catch (error) {
      console.error("Failed to fetch billing:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading billing...</div>;

  const totalTime = billing.timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const totalExpenses = billing.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalInvoiced = billing.invoices.reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/cases/${id}`)} style={styles.backButton}>
          ← Back to Case
        </button>
        <h1 style={styles.title}>Case Billing</h1>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Hours</div>
          <div style={styles.summaryValue}>{totalTime.toFixed(2)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Expenses</div>
          <div style={styles.summaryValue}>${totalExpenses.toFixed(2)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Invoiced</div>
          <div style={styles.summaryValue}>${totalInvoiced.toFixed(2)}</div>
        </div>
      </div>

      <div style={styles.sections}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Time Entries ({billing.timeEntries.length})</h2>
          <div style={styles.list}>
            {billing.timeEntries.map((entry) => (
              <div key={entry.id} style={styles.listItem}>
                <div>
                  <div style={styles.itemTitle}>{entry.description}</div>
                  <div style={styles.itemSubtitle}>
                    {entry.user?.name} • {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.itemAmount}>
                  {entry.hours}h • ${entry.amount?.toFixed(2) || "0.00"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Expenses ({billing.expenses.length})</h2>
          <div style={styles.list}>
            {billing.expenses.map((expense) => (
              <div key={expense.id} style={styles.listItem}>
                <div>
                  <div style={styles.itemTitle}>{expense.description}</div>
                  <div style={styles.itemSubtitle}>
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.itemAmount}>${expense.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1200px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { marginBottom: theme.spacing.xl },
  backButton: { background: "none", border: "none", color: theme.colors.primary, cursor: "pointer", fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing.md, padding: 0 },
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  summary: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: theme.spacing.lg, marginBottom: theme.spacing["2xl"] },
  summaryCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textAlign: "center" },
  summaryLabel: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  summaryValue: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  sections: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: theme.spacing.xl },
  section: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  sectionTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  list: { display: "flex", flexDirection: "column", gap: theme.spacing.md },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: theme.spacing.md, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md },
  itemTitle: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  itemSubtitle: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  itemAmount: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary },
};
