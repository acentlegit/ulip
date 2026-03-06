import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { theme } from "../../styles/theme";
import axios from "axios";

import { getApiUrl } from "../../config/api";
export default function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const res = await axios.post(getApiUrl("auth/verify-email"), {
        token: verificationToken
      });
      setStatus("success");
      setMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.error || "Verification failed. The link may have expired.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        {status === "verifying" && (
          <>
            <h1 style={styles.title}>Verifying Email...</h1>
            <div style={styles.spinner}></div>
          </>
        )}
        {status === "success" && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.title}>Email Verified!</h1>
            <p style={styles.message}>{message}</p>
            <Link to="/login" style={styles.button}>Go to Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div style={styles.errorIcon}>✗</div>
            <h1 style={styles.title}>Verification Failed</h1>
            <p style={styles.message}>{message}</p>
            <Link to="/register" style={styles.button}>Register Again</Link>
          </>
        )}
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
  logo: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
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
  },
  spinner: {
    border: `4px solid ${theme.colors.gray200}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    margin: `${theme.spacing.xl} auto`,
  },
  successIcon: {
    fontSize: theme.typography.fontSize["5xl"],
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
  },
  errorIcon: {
    fontSize: theme.typography.fontSize["5xl"],
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  button: {
    display: "inline-block",
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    background: theme.colors.primary,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    fontWeight: theme.typography.fontWeight.semibold,
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
};
