import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

export default function ClientCommunication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clients/${id}`);
      setClient(res.data);
      setCommunications(res.data.communications || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading communications...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/clients/${id}`)} style={styles.backButton}>
          ← Back to Client
        </button>
        <h1 style={styles.title}>Communication History</h1>
        <p style={styles.subtitle}>Client: {client.name}</p>
      </div>

      <div style={styles.communicationsList}>
        {communications.map((comm) => (
          <div key={comm.id} style={styles.commCard}>
            <div style={styles.commHeader}>
              <div style={styles.commType}>{comm.type}</div>
              <div style={styles.commDirection}>{comm.direction}</div>
              <div style={styles.commDate}>
                {new Date(comm.createdAt).toLocaleString()}
              </div>
            </div>
            {comm.subject && (
              <div style={styles.commSubject}>{comm.subject}</div>
            )}
            <div style={styles.commContent}>{comm.content}</div>
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
  communicationsList: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  commCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  commHeader: { display: "flex", gap: theme.spacing.md, alignItems: "center", marginBottom: theme.spacing.md, flexWrap: "wrap" },
  commType: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  commDirection: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.secondary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  commDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textTertiary, marginLeft: "auto" },
  commSubject: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  commContent: { fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, lineHeight: theme.typography.lineHeight.relaxed, whiteSpace: "pre-wrap" },
};
