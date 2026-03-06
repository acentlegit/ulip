import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import { getApiUrl } from "../config/api";
export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await axios.get(getApiUrl("clients/${id}"));
      setClient(res.data);
    } catch (error) {
      console.error("Failed to fetch client:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div style={styles.container}>
      <Link to="/clients" style={styles.backLink}>← Back to Clients</Link>
      <h1>{client.name}</h1>
      <div style={styles.info}>
        {client.email && <p>📧 {client.email}</p>}
        {client.phone && <p>📞 {client.phone}</p>}
        {client.address && <p>📍 {client.address}</p>}
      </div>
      <div style={styles.sections}>
        <div style={styles.section}>
          <h2>Cases ({client.cases?.length || 0})</h2>
          {client.cases?.map(c => (
            <Link key={c.id} to={`/cases/${c.id}`} style={styles.caseLink}>
              {c.title} - {c.status}
            </Link>
          ))}
        </div>
        <div style={styles.section}>
          <h2>Invoices ({client.invoices?.length || 0})</h2>
          {client.invoices?.map(i => (
            <div key={i.id} style={styles.invoiceItem}>
              {i.invoiceNumber} - ${i.total} - {i.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto" },
  backLink: { color: "#667eea", textDecoration: "none", marginBottom: "20px", display: "inline-block" },
  info: { marginBottom: "30px" },
  sections: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  section: { background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  caseLink: { display: "block", padding: "8px", marginBottom: "8px", background: "#f8f9fa", borderRadius: "6px", textDecoration: "none", color: "#333" },
  invoiceItem: { padding: "8px", marginBottom: "8px", background: "#f8f9fa", borderRadius: "6px" }
};
