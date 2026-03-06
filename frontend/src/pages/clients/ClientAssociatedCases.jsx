import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function ClientAssociatedCases() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(getApiUrl("clients/${id}"));
      setClient(res.data);
      setCases(res.data.cases || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading cases...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/clients/${id}`)} style={styles.backButton}>
          ← Back to Client
        </button>
        <h1 style={styles.title}>Associated Cases</h1>
        <p style={styles.subtitle}>Client: {client.name}</p>
      </div>

      <div style={styles.casesGrid}>
        {cases.map((case_) => (
          <Link key={case_.id} to={`/cases/${case_.id}`} style={styles.caseCard}>
            <div style={styles.caseHeader}>
              <h3 style={styles.caseTitle}>{case_.title}</h3>
              <span style={styles.caseStatus}>{case_.status}</span>
            </div>
            {case_.caseNumber && (
              <p style={styles.caseNumber}>Case #: {case_.caseNumber}</p>
            )}
            {case_.practiceArea && (
              <p style={styles.caseArea}>Practice Area: {case_.practiceArea}</p>
            )}
            <p style={styles.caseDate}>
              Opened: {new Date(case_.openedDate).toLocaleDateString()}
            </p>
          </Link>
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
  casesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: theme.spacing.lg },
  caseCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textDecoration: "none", color: "inherit", transition: theme.transitions.fast },
  caseHeader: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: theme.spacing.md },
  caseTitle: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, margin: 0, flex: 1 },
  caseStatus: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.medium },
  caseNumber: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  caseArea: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  caseDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textTertiary },
};
