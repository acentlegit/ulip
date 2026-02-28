import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

export default function ClientDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clients/${id}`);
      setClient(res.data);
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading documents...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/clients/${id}`)} style={styles.backButton}>
          ← Back to Client
        </button>
        <h1 style={styles.title}>Client Documents</h1>
        <p style={styles.subtitle}>Client: {client.name}</p>
      </div>

      <div style={styles.documentsList}>
        {documents.map((doc) => (
          <div key={doc.id} style={styles.documentCard}>
            <div style={styles.docIcon}>📄</div>
            <div style={styles.docContent}>
              <div style={styles.docName}>{doc.fileName}</div>
              <div style={styles.docMeta}>
                {new Date(doc.createdAt).toLocaleDateString()} • 
                {(doc.fileSize / 1024).toFixed(2)} KB
              </div>
            </div>
            <button style={styles.downloadButton}>Download</button>
          </div>
        ))}
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
  documentsList: { display: "flex", flexDirection: "column", gap: theme.spacing.md },
  documentCard: { background: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, display: "flex", alignItems: "center", gap: theme.spacing.lg },
  docIcon: { fontSize: theme.typography.fontSize["3xl"] },
  docContent: { flex: 1 },
  docName: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  docMeta: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  downloadButton: { padding: `${theme.spacing.sm} ${theme.spacing.md}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.medium },
};
