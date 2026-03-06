import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import { getApiUrl } from "../config/api";
export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(getApiUrl("invoices/${id}"));
      setInvoice(res.data);
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div style={styles.container}>
      <Link to="/invoices" style={styles.backLink}>← Back to Invoices</Link>
      <h1>Invoice {invoice.invoiceNumber}</h1>
      <div style={styles.info}>
        <p>Client: {invoice.client?.name}</p>
        <p>Status: {invoice.status}</p>
        <p>Total: ${invoice.total.toFixed(2)}</p>
        <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
      </div>
      <div style={styles.section}>
        <h2>Time Entries</h2>
        {invoice.timeEntries?.map(entry => (
          <div key={entry.id} style={styles.item}>
            {entry.description} - {entry.hours} hours - ${entry.amount?.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto" },
  backLink: { color: "#667eea", textDecoration: "none", marginBottom: "20px", display: "inline-block" },
  info: { marginBottom: "30px" },
  section: { background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  item: { padding: "12px", marginBottom: "8px", background: "#f8f9fa", borderRadius: "6px" }
};
