import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { theme } from "../../styles/theme";
import axios from "axios";

import { getApiUrl } from "../../config/api";
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
        await axios.post(getApiUrl("auth/reset-password"), {
        email,
        token,
        newPassword: password
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Password Reset Successful!</h1>
          <p style={styles.message}>Redirecting to login...</p>
          <Link to="/login" style={styles.button}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Enter your new password</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter new password"
              minLength={6}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Resetting..." : "Reset Password"}
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
    flexDirection: "column",
    gap: theme.spacing.sm,
    width: "100%",
    boxSizing: "border-box",
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
    width: "100%",
    boxSizing: "border-box",
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
  successIcon: {
    fontSize: theme.typography.fontSize["5xl"],
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
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
