import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { formatRole } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";

import { getApiUrl } from "../../config/api";
export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(getApiUrl("users/${id}"));
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading profile...</div>;
  if (!user) return <div>User not found</div>;

  const canEdit = currentUser?.id === user.id || currentUser?.role === "ORG_ADMIN" || currentUser?.role === "SUPER_ADMIN";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/users")} style={styles.backButton}>
          ← Back to Users
        </button>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>{user.name}</h1>
            <p style={styles.subtitle}>{user.email}</p>
          </div>
          {canEdit && (
            <Link to={`/users/${id}/edit`} style={styles.editButton}>
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      <div style={styles.tabs}>
        {["overview", "activity", "cases", "tasks"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "overview" && (
          <div style={styles.overview}>
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Contact Information</h3>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{user.email}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone:</span>
                <span style={styles.infoValue}>{user.phone || "Not provided"}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Role:</span>
                <span style={styles.roleBadge}>{formatRole(user.role)}</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Account Information</h3>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Member Since:</span>
                <span style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Last Login:</span>
                <span style={styles.infoValue}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email Verified:</span>
                <span style={styles.infoValue}>
                  {user.emailVerified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div style={styles.section}>
            <p>Activity log coming soon...</p>
          </div>
        )}

        {activeTab === "cases" && (
          <div style={styles.section}>
            <p>Cases: {user._count?.cases || 0}</p>
          </div>
        )}

        {activeTab === "tasks" && (
          <div style={styles.section}>
            <p>Tasks: {user._count?.tasks || 0}</p>
          </div>
        )}
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
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.xs, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary },
  editButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.md, textDecoration: "none", fontWeight: theme.typography.fontWeight.semibold },
  tabs: { display: "flex", gap: theme.spacing.sm, borderBottom: `2px solid ${theme.colors.borderLight}`, marginBottom: theme.spacing.xl },
  tab: { padding: `${theme.spacing.md} ${theme.spacing.lg}`, background: "transparent", border: "none", borderBottom: `2px solid transparent`, cursor: "pointer", fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textSecondary, marginBottom: "-2px" },
  tabActive: { color: theme.colors.primary, borderBottomColor: theme.colors.primary },
  content: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  overview: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: theme.spacing.xl },
  infoCard: { background: theme.colors.bgSecondary, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg },
  cardTitle: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  infoRow: { display: "flex", justifyContent: "space-between", marginBottom: theme.spacing.md },
  infoLabel: { fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, fontWeight: theme.typography.fontWeight.medium },
  infoValue: { fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary },
  roleBadge: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  section: { padding: theme.spacing.xl },
};
