import { useState } from "react";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";
import axios from "axios";

import { getApiUrl } from "../../config/api";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await axios.post(getApiUrl("auth/forgot-password"), { email });
      setMessage("If an account exists, a password reset email has been sent.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="your@email.com"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Back to Login</Link>
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
  success: {
    background: "#f0fdf4",
    color: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
    border: `1px solid #bbf7d0`,
  },
  links: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
  },
  link: {
    color: theme.colors.primary,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
};
