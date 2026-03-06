import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatRole } from "../constants/roles";

import { getApiUrl } from "../config/api";
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading users...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>Users & Organization</h1>
        <div style={styles.headerActions}>
          <Link to="/users/organization-profile" style={styles.orgButton}>
            🏢 Organization Profile
          </Link>
          <Link to="/users/add" style={styles.newButton}>+ Add User</Link>
        </div>
      </div>
      <div style={styles.usersList}>
        {users.map((user) => (
          <Link key={user.id} to={`/users/${user.id}`} style={styles.userCard}>
            <div>
              <h3 style={styles.userCardH3}>{user.name}</h3>
              <p style={styles.userCardP}>{user.email}</p>
            </div>
            <div style={styles.userMeta}>
              <span style={styles.role}>{formatRole(user.role)}</span>
              <span style={styles.stats}>
                {user._count?.cases || 0} cases • {user._count?.tasks || 0} tasks
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: "24px" 
  },
  headerActions: {
    display: "flex",
    gap: "12px"
  },
  orgButton: {
    padding: "12px 24px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "500"
  },
  headerH1: { 
    fontSize: "32px", 
    color: "#333" 
  },
  newButton: { 
    padding: "12px 24px", 
    background: "#667eea", 
    color: "white", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block"
  },
  usersList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px" 
  },
  userCard: { 
    background: "white", 
    padding: "20px", 
    borderRadius: "8px", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)", 
    display: "flex", 
    justifyContent: "space-between",
    textDecoration: "none",
    color: "inherit",
    transition: "transform 0.2s",
    cursor: "pointer"
  },
  userCardH3: { 
    margin: "0 0 8px 0", 
    color: "#333" 
  },
  userCardP: { 
    margin: 0, 
    color: "#666", 
    fontSize: "14px" 
  },
  userMeta: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "8px", 
    alignItems: "flex-end" 
  },
  role: { 
    padding: "4px 12px", 
    background: "#e3f2fd", 
    color: "#1976d2", 
    borderRadius: "12px", 
    fontSize: "12px", 
    fontWeight: "500", 
    textTransform: "capitalize" 
  },
  stats: { 
    fontSize: "14px", 
    color: "#666" 
  }
};
