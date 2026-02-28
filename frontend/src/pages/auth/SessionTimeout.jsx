import { useNavigate } from "react-router-dom";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

export default function SessionTimeout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleContinue = () => {
    // Clear session expired flag and refresh token
    localStorage.removeItem("sessionExpired");
    // Try to refresh the session
    const token = localStorage.getItem("token");
    if (token) {
      // Session will be refreshed automatically by AuthContext
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>⏱️</div>
        <h1 style={styles.title}>Session Timeout</h1>
        <p style={styles.message}>
          Your session has expired due to inactivity. Please log in again to continue.
        </p>

        <div style={styles.buttons}>
          <button onClick={handleContinue} style={styles.primaryButton}>
            Continue Session
          </button>
          <button onClick={handleLogout} style={styles.secondaryButton}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%)`,
    padding: theme.spacing.lg,
  },
  card: {
    background: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing["2xl"],
    width: "100%",
    maxWidth: "450px",
    boxShadow: theme.shadows["2xl"],
    textAlign: "center",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  icon: {
    fontSize: theme.typography.fontSize["5xl"],
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.md,
    width: "100%",
    boxSizing: "border-box",
  },
  primaryButton: {
    padding: theme.spacing.md,
    background: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: theme.transitions.fast,
    width: "100%",
    boxSizing: "border-box",
  },
  secondaryButton: {
    padding: theme.spacing.md,
    background: "transparent",
    color: theme.colors.primary,
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: theme.transitions.fast,
    width: "100%",
    boxSizing: "border-box",
  },
};
