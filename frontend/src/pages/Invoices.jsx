import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/invoices");
      setInvoices(res.data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>Invoices</h1>
        <button style={styles.newButton}>+ New Invoice</button>
      </div>
      <div style={styles.invoicesList}>
        {invoices.map((invoice) => (
          <Link key={invoice.id} to={`/invoices/${invoice.id}`} style={styles.invoiceCard}>
            <div>
              <h3>{invoice.invoiceNumber}</h3>
              <p>{invoice.client?.name}</p>
            </div>
            <div style={styles.invoiceMeta}>
              <span style={styles.amount}>${invoice.total.toFixed(2)}</span>
              <span style={{...styles.status, ...getStatusColor(invoice.status)}}>
                {invoice.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    DRAFT: { background: "#f5f5f5", color: "#666" },
    SENT: { background: "#e3f2fd", color: "#1976d2" },
    PAID: { background: "#e8f5e9", color: "#388e3c" },
    OVERDUE: { background: "#ffebee", color: "#d32f2f" }
  };
  return colors[status] || { background: "#f5f5f5", color: "#666" };
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  headerH1: { fontSize: "32px", color: "#333" },
  newButton: { padding: "12px 24px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  invoicesList: { display: "flex", flexDirection: "column", gap: "12px" },
  invoiceCard: { background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", textDecoration: "none", color: "inherit" },
  invoiceMeta: { display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" },
  amount: { fontSize: "20px", fontWeight: "600", color: "#333" },
  status: { padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }
};
