import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function CaseParties() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "PLAINTIFF",
    role: "",
    contactInfo: "",
  });

  useEffect(() => {
    fetchParties();
  }, [id]);

  const fetchParties = async () => {
    try {
      const res = await axios.get(getApiUrl("cases/${id}"));
      setParties(res.data.parties || []);
    } catch (error) {
      console.error("Failed to fetch parties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParty = async (e) => {
    e.preventDefault();
    try {
      await axios.post(getApiUrl("cases/${id}/parties"), formData);
      setShowAddForm(false);
      setFormData({ name: "", type: "PLAINTIFF", role: "", contactInfo: "" });
      fetchParties();
    } catch (error) {
      console.error("Failed to add party:", error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading parties...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/cases/${id}`)} style={styles.backButton}>
          ← Back to Case
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Case Parties</h1>
          <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
            + Add Party
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={styles.card}>
          <h2 style={styles.formTitle}>Add New Party</h2>
          <form onSubmit={handleAddParty} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={styles.select}
                >
                  <option value="PLAINTIFF">Plaintiff</option>
                  <option value="DEFENDANT">Defendant</option>
                  <option value="WITNESS">Witness</option>
                  <option value="THIRD_PARTY">Third Party</option>
                </select>
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Info</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.formButtons}>
              <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>Add Party</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.partiesGrid}>
        {parties.map((party) => (
          <div key={party.id} style={styles.partyCard}>
            <div style={styles.partyHeader}>
              <h3 style={styles.partyName}>{party.name}</h3>
              <span style={styles.partyType}>{party.type}</span>
            </div>
            {party.role && <p style={styles.partyRole}>Role: {party.role}</p>}
            {party.contactInfo && <p style={styles.partyContact}>{party.contactInfo}</p>}
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
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  addButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  card: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  form: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  formRow: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: theme.spacing.lg },
  formGroup: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary },
  input: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base },
  select: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
  formButtons: { display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" },
  cancelButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.gray200, color: theme.colors.textPrimary, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer" },
  submitButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  partiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: theme.spacing.lg },
  partyCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  partyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  partyName: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, margin: 0 },
  partyType: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.medium },
  partyRole: { fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  partyContact: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
};
