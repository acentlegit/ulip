import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { formatRole } from "../../constants/roles";

import { getApiUrl } from "../../config/api";
export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await axios.get(getApiUrl("users"));
      setUsers(usersRes.data);
      // Group users by role for team view
      const grouped = groupByRole(usersRes.data);
      setTeams(grouped);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupByRole = (userList) => {
    const groups = {};
    userList.forEach((user) => {
      if (!groups[user.role]) {
        groups[user.role] = [];
      }
      groups[user.role].push(user);
    });
    return Object.entries(groups).map(([role, members]) => ({
      role,
      members,
    }));
  };

  if (loading) return <div style={styles.loading}>Loading teams...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Team Management</h1>
        <Link to="/users/add" style={styles.addButton}>
          + Add Team Member
        </Link>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{users.length}</div>
          <div style={styles.statLabel}>Total Team Members</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{teams.length}</div>
          <div style={styles.statLabel}>Role Groups</div>
        </div>
      </div>

      <div style={styles.teamsGrid}>
        {teams.map((team) => (
          <div key={team.role} style={styles.teamCard}>
            <h2 style={styles.teamTitle}>{formatRole(team.role)}</h2>
            <div style={styles.memberCount}>{team.members.length} members</div>
            <div style={styles.membersList}>
              {team.members.map((member) => (
                <Link
                  key={member.id}
                  to={`/users/${member.id}`}
                  style={styles.memberItem}
                >
                  <div style={styles.memberName}>{member.name}</div>
                  <div style={styles.memberEmail}>{member.email}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1400px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing["2xl"] },
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  addButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.md, textDecoration: "none", fontWeight: theme.typography.fontWeight.semibold },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: theme.spacing.lg, marginBottom: theme.spacing["2xl"] },
  statCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, textAlign: "center" },
  statValue: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  statLabel: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
  teamsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: theme.spacing.xl },
  teamCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  teamTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm, color: theme.colors.textPrimary },
  memberCount: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  membersList: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  memberItem: { padding: theme.spacing.md, background: theme.colors.bgSecondary, borderRadius: theme.borderRadius.md, textDecoration: "none", color: "inherit", transition: theme.transitions.fast },
  memberName: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  memberEmail: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
};
