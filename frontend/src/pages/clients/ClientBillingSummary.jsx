import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function ClientBillingSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const clientRes = await axios.get(getApiUrl("clients/${id}"));
      setClient(clientRes.data);
      
      const invoicesRes = await axios.get(getApiUrl("invoices"));
      const clientInvoices = invoicesRes.data.filter(inv => inv.clientId === id);
      setInvoices(clientInvoices);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading billing...</div>;
  if (!client) return <div>Client not found</div>;

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = invoices.filter(inv => inv.status === "PAID").reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPending = invoices.filter(inv => inv.status === "SENT").reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalOverdue = invoices.filter(inv => inv.status === "OVERDUE").reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/clients/${id}`)} style={styles.backButton}>
          ← Back to Client
        </button>
        <h1 style={styles.title}>Billing Summary</h1>
        <p style={styles.subtitle}>Client: {client.name}</p>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Invoiced</div>
          <div style={styles.summaryValue}>${totalInvoiced.toFixed(2)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Paid</div>
          <div style={{...styles.summaryValue, color: theme.colors.success}}>${totalPaid.toFixed(2)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Pending</div>
          <div style={{...styles.summaryValue, color: theme.colors.warning}}>${totalPending.toFixed(2)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Overdue</div>
          <div style={{...styles.summaryValue, color: theme.colors.error}}>${totalOverdue.toFixed(2)}</div>
        </div>
      </div>

      <div style={styles.invoicesSection}>
        <h2 style={styles.sectionTitle}>Invoices ({invoices.length})</h2>
        <div style={styles.invoicesList}>
          {invoices.map((invoice) => (
            <div key={invoice.id} style={styles.invoiceCard}>
              <div style={styles.invoiceHeader}>
                <div>
                  <div style={styles.invoiceNumber}>{invoice.invoiceNumber}</div>
                  <div style={styles.invoiceDate}>
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.invoiceAmount}>${invoice.total.toFixed(2)}</div>
              </div>
              <div style={styles.invoiceStatus}>
                Status: <span style={styles.statusBadge}>{invoice.status}</span>
              </div>
            </div>
          ))}
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
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.xs, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary },
  summary: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: theme.spacing.lg, marginBottom: theme.spacing["2xl"] },
  summaryCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textAlign: "center" },
  summaryLabel: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  summaryValue: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  invoicesSection: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  sectionTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  invoicesList: { display: "flex", flexDirection: "column", gap: theme.spacing.md },
  invoiceCard: { padding: theme.spacing.lg, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md },
  invoiceHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.sm },
  invoiceNumber: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  invoiceDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  invoiceAmount: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  invoiceStatus: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  statusBadge: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.medium, marginLeft: theme.spacing.sm },
};
