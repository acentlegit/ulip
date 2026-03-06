import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { theme } from "../styles/theme";
import { UserRoles, RoleDisplayNames } from "../constants/roles";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Required: helps identify account type
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState("");
  const { login, ssoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!role) {
      setError("Please select your role");
      return;
    }
    
    setLoading(true);

    const result = await login(email, password, role);
    
    if (result.success) {
      // Check if user has 2FA enabled
      // For now, redirect to dashboard. In real app, check 2FA status
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSSO = async (provider) => {
    if (!role) {
      setError("Please select your role before continuing with SSO");
      return;
    }
    
    setSsoLoading(provider);
    setError("");
    
    try {
      // Pass role in the SSO request so backend can validate it
      // Redirect directly to backend SSO endpoint with role parameter
      // Backend will redirect to Google/Microsoft/Okta login page
      // After user authenticates, provider redirects back to backend callback
      // Backend processes and redirects to frontend with token
      window.location.href = `${API_BASE_URL}/api/auth/sso/${provider}?role=${encodeURIComponent(role)}`;
    } catch (err) {
      console.error("SSO error:", err);
      setError(`SSO authentication with ${provider} failed. Please use email/password login.`);
      setSsoLoading("");
    }
  };

  const handle2FA = () => {
    // Store email temporarily for 2FA flow
    if (email) {
      localStorage.setItem("tempEmail", email);
      navigate("/2fa");
    } else {
      setError("Please enter your email first");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚖️ Legal Platform</div>
        <p style={styles.subtitle}>Sign in to your account</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
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
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(26, 35, 126, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.borderLight;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Your Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={styles.select}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(26, 35, 126, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.borderLight;
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Select your role</option>
              <option value={UserRoles.SUPER_ADMIN}>{RoleDisplayNames[UserRoles.SUPER_ADMIN]}</option>
              <option value={UserRoles.ORG_ADMIN}>{RoleDisplayNames[UserRoles.ORG_ADMIN]}</option>
              <option value={UserRoles.LAWYER}>{RoleDisplayNames[UserRoles.LAWYER]}</option>
              <option value={UserRoles.PARALEGAL}>{RoleDisplayNames[UserRoles.PARALEGAL]}</option>
              <option value={UserRoles.FINANCE}>{RoleDisplayNames[UserRoles.FINANCE]}</option>
              <option value={UserRoles.CLIENT}>{RoleDisplayNames[UserRoles.CLIENT]}</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(26, 35, 126, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.borderLight;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkbox}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={handle2FA}
              style={styles.twoFactorLink}
            >
              Use 2FA instead
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading || !!ssoLoading}
            style={{
              ...styles.button,
              ...(loading || ssoLoading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading && !ssoLoading) {
                e.target.style.background = theme.colors.primaryDark;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !ssoLoading) {
                e.target.style.background = theme.colors.primary;
              }
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        {/* SSO Buttons */}
        <div style={styles.ssoSection}>
          <button
            type="button"
            onClick={() => handleSSO("google")}
            disabled={!!ssoLoading}
            style={{
              ...styles.ssoButton,
              ...(ssoLoading === "google" ? styles.ssoButtonLoading : {})
            }}
            onMouseEnter={(e) => {
              if (!ssoLoading) {
                e.target.style.background = theme.colors.gray100;
                e.target.style.borderColor = theme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!ssoLoading) {
                e.target.style.background = theme.colors.white;
                e.target.style.borderColor = theme.colors.borderLight;
              }
            }}
          >
            <span style={styles.googleIcon}>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.205c0-.637-.057-1.248-.164-1.836H9v3.479h4.842c-.209 1.125-.843 2.077-1.747 2.716v2.268h2.809c1.645-1.514 2.593-3.743 2.593-6.387z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 6.039-2.196l-2.809-2.187c-.806.556-1.836.879-3.23.879-2.484 0-4.581-1.679-5.332-3.942H.688v2.258C2.435 15.983 5.06 18 9 18z" fill="#34A853"/>
                  <path d="M3.668 10.717c-.184-.556-.462-1.075-.814-1.472V7.007H.688C.724 8.462 0 10.176 0 12s.724 3.538 1.688 4.993l2.907-2.258c-.51-1.463-.51-3.065 0-4.518z" fill="#FBBC05"/>
                  <path d="M9 3.584c1.321 0 2.507.443 3.441 1.194l2.587-2.587C13.463.907 11.529.43 9.999.43 6.06 3.177 3.177 6.06 3.177 9.999z" fill="#EA4335"/>
                </g>
              </svg>
            </span>
            {ssoLoading === "google" ? "Connecting..." : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={() => handleSSO("microsoft")}
            disabled={!!ssoLoading}
            style={{
              ...styles.ssoButton,
              ...(ssoLoading === "microsoft" ? styles.ssoButtonLoading : {})
            }}
            onMouseEnter={(e) => {
              if (!ssoLoading) {
                e.target.style.background = theme.colors.gray100;
                e.target.style.borderColor = theme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!ssoLoading) {
                e.target.style.background = theme.colors.white;
                e.target.style.borderColor = theme.colors.borderLight;
              }
            }}
          >
            <span style={styles.microsoftIcon}>
              <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <rect width="10" height="10" fill="#F25022"/>
                <rect x="11" width="10" height="10" fill="#80BC43"/>
                <rect y="11" width="10" height="10" fill="#00A4EF"/>
                <rect x="11" y="11" width="10" height="10" fill="#FFBA40"/>
              </svg>
            </span>
            {ssoLoading === "microsoft" ? "Connecting..." : "Continue with Microsoft"}
          </button>

          <button
            type="button"
            onClick={() => handleSSO("okta")}
            disabled={!!ssoLoading}
            style={{
              ...styles.ssoButton,
              ...(ssoLoading === "okta" ? styles.ssoButtonLoading : {})
            }}
            onMouseEnter={(e) => {
              if (!ssoLoading) {
                e.target.style.background = theme.colors.gray100;
                e.target.style.borderColor = theme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!ssoLoading) {
                e.target.style.background = theme.colors.white;
                e.target.style.borderColor = theme.colors.borderLight;
              }
            }}
          >
            <span style={styles.oktaIcon}>O</span>
            {ssoLoading === "okta" ? "Connecting..." : "Continue with Okta"}
          </button>
        </div>
        
        <div style={styles.links}>
          <span style={styles.linkText}>Don't have an account?</span>
          <Link to="/register" style={styles.link}>
            Create Account
          </Link>
        </div>
        
        <div style={styles.backLink}>
          <Link to="/" style={styles.backLinkText}>
            ← Back to Home
          </Link>
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
    boxSizing: "border-box",
    overflow: "auto",
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
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  error: {
    background: "#fef2f2",
    color: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.lg,
    border: `1px solid #fecaca`,
  },
  ssoSection: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
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
    color: theme.colors.textPrimary,
  },
  ssoButtonLoading: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  googleIcon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  microsoftIcon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  oktaIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#007DC1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    flexShrink: 0,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    width: "100%",
    boxSizing: "border-box",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: theme.colors.borderLight,
  },
  dividerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
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
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  input: {
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    outline: "none",
    transition: theme.transitions.fast,
    background: theme.colors.white,
    color: theme.colors.textPrimary,
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    outline: "none",
    transition: theme.transitions.fast,
    background: theme.colors.white,
    color: theme.colors.textPrimary,
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: 0,
  },
  forgotLink: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.medium,
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  twoFactorLink: {
    background: "none",
    border: "none",
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    textDecoration: "none",
    padding: 0,
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
    marginTop: theme.spacing.sm,
    width: "100%",
    boxSizing: "border-box",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  links: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
    fontSize: theme.typography.fontSize.sm,
    width: "100%",
    boxSizing: "border-box",
  },
  linkText: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  link: {
    color: theme.colors.primary,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.semibold,
  },
  backLink: {
    marginTop: theme.spacing.lg,
    textAlign: "center",
    fontSize: theme.typography.fontSize.sm,
    width: "100%",
    boxSizing: "border-box",
  },
  backLinkText: {
    color: theme.colors.textSecondary,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.medium,
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    transition: theme.transitions.fast,
  },
};
