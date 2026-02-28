import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../styles/theme";

export default function SSOLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSSO = async (provider) => {
    setLoading(true);
    // In a real app, this would redirect to the SSO provider
    // For now, we'll simulate it
    setTimeout(() => {
      setLoading(false);
      // After SSO, redirect to dashboard
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        <h1 style={styles.title}>Single Sign-On</h1>
        <p style={styles.subtitle}>Sign in with your organization account</p>

        <div style={styles.ssoButtons}>
          <button
            onClick={() => handleSSO("google")}
            disabled={loading}
            style={styles.ssoButton}
          >
            <span style={styles.ssoIcon}>🔐</span>
            Continue with Google
          </button>

          <button
            onClick={() => handleSSO("microsoft")}
            disabled={loading}
            style={styles.ssoButton}
          >
            <span style={styles.ssoIcon}>🔐</span>
            Continue with Microsoft
          </button>

          <button
            onClick={() => handleSSO("okta")}
            disabled={loading}
            style={styles.ssoButton}
          >
            <span style={styles.ssoIcon}>🔐</span>
            Continue with Okta
          </button>
        </div>

        <div style={styles.divider}>
          <span>OR</span>
        </div>

        <button
          onClick={() => navigate("/login")}
          style={styles.emailButton}
        >
          Sign in with Email
        </button>
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
    boxSizing: "border-box",
    overflow: "hidden",
  },
  logo: {
    textAlign: "center",
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  ssoButtons: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    width: "100%",
    boxSizing: "border-box",
  },
  ssoButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    background: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: theme.transitions.fast,
    width: "100%",
    boxSizing: "border-box",
  },
  ssoIcon: {
    fontSize: theme.typography.fontSize.xl,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    margin: `${theme.spacing.lg} 0`,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  emailButton: {
    width: "100%",
    padding: theme.spacing.md,
    background: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
};
