import { useState, useEffect } from "react";
import axios from "axios";
import { theme } from "../../styles/theme";
import { UserRoles, getAllRoles, getRoleDisplayName, getRoleDescription } from "../../constants/roles";

import { getApiUrl } from "../../config/api";
export default function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(getApiUrl("users"));
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(getApiUrl("users/${userId}"), { role });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Role & Permission Management</h1>
      <p style={styles.subtitle}>Manage user roles and permissions</p>

      <div style={styles.rolesInfo}>
        <h2 style={styles.sectionTitle}>Available Roles</h2>
        <div style={styles.rolesGrid}>
          {getAllRoles().map((role) => (
            <div key={role} style={styles.roleCard}>
              <h3 style={styles.roleName}>{getRoleDisplayName(role)}</h3>
              <p style={styles.roleDesc}>{getRoleDescription(role)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.usersSection}>
        <h2 style={styles.sectionTitle}>Users</h2>
        <div style={styles.usersList}>
          {users.map((user) => (
            <div key={user.id} style={styles.userRow}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userEmail}>{user.email}</div>
              </div>
              <div style={styles.userActions}>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={styles.roleSelect}
                >
                  {getAllRoles().map((role) => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1200px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm, color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary, marginBottom: theme.spacing["2xl"] },
  rolesInfo: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, marginBottom: theme.spacing.xl },
  sectionTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: theme.spacing.lg },
  roleCard: { padding: theme.spacing.lg, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md },
  roleName: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm, color: theme.colors.textPrimary },
  roleDesc: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  usersSection: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  usersList: { display: "flex", flexDirection: "column", gap: theme.spacing.md },
  userRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: theme.spacing.lg, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md },
  userInfo: { flex: 1 },
  userName: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  userEmail: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  userActions: { display: "flex", gap: theme.spacing.md },
  roleSelect: { padding: `${theme.spacing.sm} ${theme.spacing.md}`, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
};
