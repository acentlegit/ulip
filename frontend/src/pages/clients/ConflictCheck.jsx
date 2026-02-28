import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

export default function ConflictCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [conflictChecks, setConflictChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    result: "CLEAR",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clients/${id}`);
      setClient(res.data);
      setConflictChecks(res.data.conflictChecks || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/clients/${id}/conflict-check`, formData);
      setShowForm(false);
      setFormData({ result: "CLEAR", notes: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to submit conflict check:", error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading conflict checks...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/clients/${id}`)} style={styles.backButton}>
          ← Back to Client
        </button>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Conflict Check</h1>
            <p style={styles.subtitle}>Client: {client.name}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            + New Check
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.card}>
          <h2 style={styles.formTitle}>Perform Conflict Check</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Result *</label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                required
                style={styles.select}
              >
                <option value="CLEAR">Clear</option>
                <option value="CONFLICT">Conflict Found</option>
                <option value="REVIEW">Needs Review</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={styles.textarea}
                rows={4}
              />
            </div>
            <div style={styles.formButtons}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>Submit Check</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.checksList}>
        {conflictChecks.map((check) => (
          <div key={check.id} style={styles.checkCard}>
            <div style={styles.checkHeader}>
              <div style={styles.checkResult}>{check.result}</div>
              <div style={styles.checkDate}>
                {new Date(check.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style={styles.checkBy}>Checked by: {check.checkedBy}</div>
            {check.notes && (
              <div style={styles.checkNotes}>{check.notes}</div>
            )}
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
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.xs, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary },
  addButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  card: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  form: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  formGroup: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary },
  select: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
  textarea: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, fontFamily: "inherit", resize: "vertical" },
  formButtons: { display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" },
  cancelButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.gray200, color: theme.colors.textPrimary, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer" },
  submitButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  checksList: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  checkCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  checkHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  checkResult: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  checkDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textTertiary },
  checkBy: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  checkNotes: { fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary, padding: theme.spacing.md, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md, whiteSpace: "pre-wrap" },
};
