import { useState, useEffect } from "react";
import axios from "axios";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { isAdminRole } from "../../constants/roles";

import { getApiUrl } from "../../config/api";
export default function OrganizationProfile() {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", 
    domain: "",
    subscriptionTier: "FREE"
  });

  const subscriptionTiers = ["FREE", "BASIC", "PRO", "ENTERPRISE"];

  useEffect(() => {
    fetchOrganization();
    fetchStats();
  }, []);

  const fetchOrganization = async () => {
    try {
      const res = await axios.get(getApiUrl("organizations"));
      setOrg(res.data);
      setFormData({
        name: res.data.name,
        domain: res.data.domain || "",
        subscriptionTier: res.data.subscriptionTier || "FREE"
      });
    } catch (error) {
      console.error("Failed to fetch organization:", error);
      setError("Failed to load organization details");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(getApiUrl("organizations/stats"));
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch organization stats:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put(getApiUrl("organizations"), {
        name: formData.name,
        domain: formData.domain || null,
        subscriptionTier: formData.subscriptionTier
      });
      
      setOrg(res.data);
      setSuccess("Organization updated successfully!");
      setEditing(false);
      
      // Refresh stats
      fetchStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update organization:", error);
      setError(error.response?.data?.error || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setSuccess("");
    // Reset form data to original values
    if (org) {
      setFormData({
        name: org.name,
        domain: org.domain || "",
        subscriptionTier: org.subscriptionTier || "FREE"
      });
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!org) return <div style={styles.error}>Organization not found</div>;

  const canEdit = isAdminRole(user?.role);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Organization Profile</h1>
        {!editing && canEdit && (
          <button onClick={() => setEditing(true)} style={styles.editButton}>
            Edit
          </button>
        )}
      </div>

      {error && (
        <div style={styles.alertError}>
          {error}
        </div>
      )}

      {success && (
        <div style={styles.alertSuccess}>
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.users}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.cases.total}</div>
            <div style={styles.statLabel}>Total Cases</div>
            <div style={styles.statSubtext}>{stats.cases.active} active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.clients}</div>
            <div style={styles.statLabel}>Clients</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.documents}</div>
            <div style={styles.statLabel}>Documents</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.tasks.active}</div>
            <div style={styles.statLabel}>Active Tasks</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.revenue.total.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {editing ? (
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Organization Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
                placeholder="Your Organization Name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                style={styles.input}
                placeholder="example.com"
              />
              <p style={styles.helperText}>Optional: Your organization's domain name</p>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subscription Tier</label>
              <select
                value={formData.subscriptionTier}
                onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                style={styles.select}
              >
                {subscriptionTiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
              <p style={styles.helperText}>Current subscription plan</p>
            </div>
            <div style={styles.formButtons}>
              <button 
                onClick={handleCancel} 
                style={styles.cancelButton}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                style={styles.saveButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.info}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Organization Name:</span>
              <span style={styles.infoValue}>{org.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Domain:</span>
              <span style={styles.infoValue}>{org.domain || "Not set"}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Subscription Tier:</span>
              <span style={{
                ...styles.tierBadge,
                ...(org.subscriptionTier === "ENTERPRISE" ? styles.tierEnterprise :
                    org.subscriptionTier === "PRO" ? styles.tierPro :
                    org.subscriptionTier === "BASIC" ? styles.tierBasic :
                    styles.tierFree)
              }}>
                {org.subscriptionTier}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Created:</span>
              <span style={styles.infoValue}>
                {new Date(org.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>
            {org._count && (
              <>
                <div style={styles.divider}></div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Users:</span>
                  <span style={styles.infoValue}>{org._count.users}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Cases:</span>
                  <span style={styles.infoValue}>{org._count.cases}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Clients:</span>
                  <span style={styles.infoValue}>{org._count.clients}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Documents:</span>
                  <span style={styles.infoValue}>{org._count.documents}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: theme.spacing.xl, 
    maxWidth: "1200px", 
    margin: "0 auto" 
  },
  loading: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    height: "100vh", 
    fontSize: theme.typography.fontSize.xl 
  },
  error: {
    padding: theme.spacing.xl,
    textAlign: "center",
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.lg
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: theme.spacing.xl 
  },
  title: { 
    fontSize: theme.typography.fontSize["3xl"], 
    fontWeight: theme.typography.fontWeight.bold, 
    color: theme.colors.textPrimary 
  },
  editButton: { 
    padding: `${theme.spacing.md} ${theme.spacing.xl}`, 
    background: theme.colors.primary, 
    color: theme.colors.white, 
    border: "none", 
    borderRadius: theme.borderRadius.md, 
    cursor: "pointer", 
    fontWeight: theme.typography.fontWeight.semibold,
    transition: theme.transitions.fast
  },
  alertError: {
    padding: theme.spacing.md,
    background: "#fef2f2",
    color: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    border: `1px solid #fecaca`
  },
  alertSuccess: {
    padding: theme.spacing.md,
    background: "#f0fdf4",
    color: "#16a34a",
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    border: `1px solid #bbf7d0`
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl
  },
  statCard: {
    background: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.md,
    textAlign: "center"
  },
  statValue: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium
  },
  statSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs
  },
  card: { 
    background: theme.colors.white, 
    padding: theme.spacing["2xl"], 
    borderRadius: theme.borderRadius.xl, 
    boxShadow: theme.shadows.lg 
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: theme.spacing.lg 
  },
  formGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: theme.spacing.sm 
  },
  label: { 
    fontSize: theme.typography.fontSize.sm, 
    fontWeight: theme.typography.fontWeight.medium, 
    color: theme.colors.textPrimary 
  },
  input: { 
    padding: theme.spacing.md, 
    border: `1px solid ${theme.colors.borderLight}`, 
    borderRadius: theme.borderRadius.md, 
    fontSize: theme.typography.fontSize.base,
    outline: "none",
    transition: theme.transitions.fast
  },
  select: {
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    outline: "none",
    background: theme.colors.white,
    cursor: "pointer",
    transition: theme.transitions.fast
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs
  },
  formButtons: { 
    display: "flex", 
    gap: theme.spacing.md, 
    justifyContent: "flex-end", 
    marginTop: theme.spacing.lg 
  },
  cancelButton: { 
    padding: `${theme.spacing.md} ${theme.spacing.xl}`, 
    background: theme.colors.gray200, 
    color: theme.colors.textPrimary, 
    border: "none", 
    borderRadius: theme.borderRadius.md, 
    cursor: "pointer",
    fontWeight: theme.typography.fontWeight.medium,
    transition: theme.transitions.fast
  },
  saveButton: { 
    padding: `${theme.spacing.md} ${theme.spacing.xl}`, 
    background: theme.colors.primary, 
    color: theme.colors.white, 
    border: "none", 
    borderRadius: theme.borderRadius.md, 
    cursor: "pointer", 
    fontWeight: theme.typography.fontWeight.semibold,
    transition: theme.transitions.fast
  },
  info: { 
    display: "flex", 
    flexDirection: "column", 
    gap: theme.spacing.md 
  },
  infoRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: theme.spacing.md, 
    background: theme.colors.bgSecondary, 
    borderRadius: theme.borderRadius.md 
  },
  infoLabel: { 
    fontSize: theme.typography.fontSize.base, 
    fontWeight: theme.typography.fontWeight.medium, 
    color: theme.colors.textSecondary 
  },
  infoValue: { 
    fontSize: theme.typography.fontSize.base, 
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium
  },
  tierBadge: { 
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`, 
    color: theme.colors.white, 
    borderRadius: theme.borderRadius.full, 
    fontSize: theme.typography.fontSize.sm, 
    fontWeight: theme.typography.fontWeight.medium 
  },
  tierFree: {
    background: "#6b7280"
  },
  tierBasic: {
    background: "#3b82f6"
  },
  tierPro: {
    background: "#8b5cf6"
  },
  tierEnterprise: {
    background: "#f59e0b"
  },
  divider: {
    height: "1px",
    background: theme.colors.borderLight,
    margin: `${theme.spacing.md} 0`
  }
};
