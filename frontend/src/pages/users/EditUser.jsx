import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { UserRoles, getAllRoles, getRoleDisplayName, isAdminRole } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";

import { getApiUrl } from "../../config/api";
export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(getApiUrl("users/${id}"));
      setFormData({
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        phone: res.data.phone || "",
      });
    } catch (err) {
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await axios.put(getApiUrl("users/${id}"), formData);
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading user...</div>;

  const canEditRole = isAdminRole(currentUser?.role);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/users")} style={styles.backButton}>
          ← Back to Users
        </button>
        <h1 style={styles.title}>Edit User</h1>
      </div>

      <div style={styles.card}>
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={styles.input}
                disabled
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={styles.input}
              />
            </div>

            {canEditRole && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  style={styles.select}
                >
                  {getAllRoles().map((role) => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={() => navigate("/users")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.submitButton}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "900px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { marginBottom: theme.spacing.xl },
  backButton: { background: "none", border: "none", color: theme.colors.primary, cursor: "pointer", fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing.md, padding: 0 },
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  card: { background: theme.colors.white, padding: theme.spacing["2xl"], borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.lg },
  error: { background: "#fef2f2", color: theme.colors.error, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg, border: `1px solid #fecaca` },
  form: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  formRow: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: theme.spacing.lg },
  formGroup: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary },
  input: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, transition: theme.transitions.fast },
  select: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
  buttons: { display: "flex", gap: theme.spacing.md, justifyContent: "flex-end", marginTop: theme.spacing.lg },
  cancelButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.gray200, color: theme.colors.textPrimary, border: "none", borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, cursor: "pointer" },
  submitButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, cursor: "pointer" },
};
