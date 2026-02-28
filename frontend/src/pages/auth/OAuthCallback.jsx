import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../styles/theme";
import axios from "axios";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ssoLogin } = useAuth();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const provider = searchParams.get("provider");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      setStatus("error");
      setTimeout(() => {
        navigate("/login?error=" + encodeURIComponent(errorParam));
      }, 2000);
      return;
    }

    // If we have a code but no token, the backend callback hasn't processed it yet
    const code = searchParams.get("code");
    if (code && !token) {
      setError("OAuth code received but token not generated. Please try again.");
      setStatus("error");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (token) {
      // Decode the token (it was URL encoded)
      const decodedToken = decodeURIComponent(token);
      // Token received from OAuth callback
      handleToken(decodedToken);
    } else {
      setError("No authentication token received");
      setStatus("error");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [searchParams, navigate, ssoLogin]);

  const handleToken = async (token) => {
    try {
      // Validate token format
      if (!token || typeof token !== 'string' || token.length < 10) {
        throw new Error("Invalid token format");
      }

      // Set token in axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Fetch user data with token
      const response = await axios.get("http://localhost:5000/api/auth/me");
      
      if (response.data && response.data.user) {
        // Update auth context with token and user
        const result = await ssoLogin(token, response.data.user);
        
        if (result.success) {
          setStatus("success");
          // Use window.location for hard redirect to ensure auth context is ready
          // This bypasses React Router and ensures the page fully reloads with auth
          // Small delay to show success message, then redirect
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
          return; // Exit early
        } else {
          throw new Error(result.error || "Failed to update authentication context");
        }
      } else {
        throw new Error("Invalid user data received from server");
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details ||
                          err.message || 
                          "Failed to complete authentication";
      setError(errorMessage);
      setStatus("error");
      setTimeout(() => {
        navigate("/login?error=" + encodeURIComponent(errorMessage));
      }, 2000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        
        {status === "processing" && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Completing authentication...</h2>
            <p style={styles.subtitle}>Please wait while we sign you in</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Authentication successful!</h2>
            <p style={styles.subtitle}>Redirecting to dashboard...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div style={styles.errorIcon}>✗</div>
            <h2 style={styles.title}>Authentication failed</h2>
            <p style={styles.subtitle}>{error || "An error occurred during authentication"}</p>
            <p style={styles.redirectText}>Redirecting to login...</p>
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
  },
  logo: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  redirectText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: `4px solid ${theme.colors.borderLight}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 24px",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#10b981",
    color: "white",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontWeight: "bold",
  },
  errorIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: theme.colors.error,
    color: "white",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontWeight: "bold",
  },
};

// Add spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
