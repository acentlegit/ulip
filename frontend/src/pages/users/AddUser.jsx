import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { UserRoles, getAllRoles, getRoleDisplayName } from "../../constants/roles";

import { getApiUrl } from "../../config/api";
export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRoles.PARALEGAL,
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(getApiUrl("users"), formData);
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/users")} style={styles.backButton}>
          ← Back to Users
        </button>
        <h1 style={styles.title}>Add New User</h1>
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
                placeholder="John Doe"
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
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                style={styles.input}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={styles.input}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

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

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={() => navigate("/users")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: theme.spacing.xl,
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    background: "none",
    border: "none",
    color: theme.colors.primary,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  card: {
    background: theme.colors.white,
    padding: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.lg,
  },
  error: {
    background: "#fef2f2",
    color: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    border: `1px solid #fecaca`,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.lg,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: theme.spacing.lg,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  input: {
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    transition: theme.transitions.fast,
  },
  select: {
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    background: theme.colors.white,
  },
  buttons: {
    display: "flex",
    gap: theme.spacing.md,
    justifyContent: "flex-end",
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    background: theme.colors.gray200,
    color: theme.colors.textPrimary,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
  },
  submitButton: {
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    background: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
  },
};
