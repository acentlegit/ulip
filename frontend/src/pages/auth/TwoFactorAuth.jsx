import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../styles/theme";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real app, this would verify the 2FA code
      // For now, we'll simulate it
      const result = await login(localStorage.getItem("tempEmail"), localStorage.getItem("tempPassword"));
      if (result.success) {
        localStorage.removeItem("tempEmail");
        localStorage.removeItem("tempPassword");
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        <h1 style={styles.title}>Two-Factor Authentication</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code from your authenticator app
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              style={styles.codeInput}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading || code.length !== 6} style={styles.button}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div style={styles.links}>
          <button style={styles.linkButton} onClick={() => navigate("/login")}>
            Use a different method
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.lg,
    width: "100%",
    boxSizing: "border-box",
  },
  formGroup: {
    display: "flex",
    justifyContent: "center",
  },
  codeInput: {
    padding: theme.spacing.md,
    border: `2px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: "center",
    letterSpacing: "0.5em",
    width: "200px",
    transition: theme.transitions.fast,
  },
  button: {
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
  error: {
    background: "#fef2f2",
    color: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
    border: `1px solid #fecaca`,
  },
  links: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: theme.colors.primary,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
};
