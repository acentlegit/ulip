import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";

export default function Landing() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚖️</span>
            <span style={styles.logoText}>Legal Platform</span>
          </div>
          <nav style={styles.nav}>
            <Link to="/pricing" style={styles.navLink}>Pricing</Link>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/register" style={styles.ctaButton}>Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            The Complete Legal Practice
            <br />
            Management Platform
          </h1>
          <p style={styles.heroSubtitle}>
            Streamline your law firm operations with case management, billing, document handling,
            and client communication all in one powerful platform.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/register" style={styles.primaryButton}>
              Start Free Trial
            </Link>
            <Link to="/pricing" style={styles.secondaryButton}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.featuresContent}>
          <h2 style={styles.sectionTitle}>Everything You Need to Run Your Practice</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Transform Your Legal Practice?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of law firms already using Legal Platform
          </p>
          <Link to="/register" style={styles.ctaButtonLarge}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>&copy; 2026 Legal Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📁",
    title: "Case Management",
    description: "Organize and track all your cases with comprehensive case files, timelines, and documents."
  },
  {
    icon: "👥",
    title: "Client Management",
    description: "Maintain detailed client records, communication history, and billing information."
  },
  {
    icon: "💰",
    title: "Billing & Invoicing",
    description: "Track time, generate invoices, and manage payments seamlessly."
  },
  {
    icon: "📄",
    title: "Document Management",
    description: "Secure document storage with version control and e-signature capabilities."
  },
  {
    icon: "📅",
    title: "Calendar & Deadlines",
    description: "Never miss a court date or deadline with intelligent calendar management."
  },
  {
    icon: "📊",
    title: "Analytics & Reports",
    description: "Gain insights into your practice with comprehensive reporting and analytics."
  }
];

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: theme.colors.white,
    boxShadow: theme.shadows.sm,
    position: "sticky",
    top: 0,
    zIndex: theme.zIndex.sticky,
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: theme.spacing.lg,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  logoIcon: {
    fontSize: theme.typography.fontSize["3xl"],
  },
  logoText: {
    fontFamily: theme.typography.fontFamily.secondary,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  navLink: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    transition: theme.transitions.fast,
  },
  ctaButton: {
    background: theme.colors.primary,
    color: theme.colors.white,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
    fontWeight: theme.typography.fontWeight.semibold,
    transition: theme.transitions.fast,
  },
  hero: {
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%)`,
    color: theme.colors.white,
    padding: `${theme.spacing["3xl"]} ${theme.spacing.lg}`,
    textAlign: "center",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: theme.typography.fontSize["5xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.tight,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing.xl,
    opacity: 0.9,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  heroButtons: {
    display: "flex",
    gap: theme.spacing.md,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: theme.colors.white,
    color: theme.colors.primary,
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    borderRadius: theme.borderRadius.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.lg,
    transition: theme.transitions.fast,
    display: "inline-block",
  },
  secondaryButton: {
    background: "transparent",
    color: theme.colors.white,
    border: `2px solid ${theme.colors.white}`,
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    borderRadius: theme.borderRadius.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.lg,
    transition: theme.transitions.fast,
    display: "inline-block",
  },
  features: {
    padding: `${theme.spacing["3xl"]} ${theme.spacing.lg}`,
    background: theme.colors.bgSecondary,
  },
  featuresContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: theme.spacing["2xl"],
    color: theme.colors.textPrimary,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: theme.spacing.xl,
  },
  featureCard: {
    background: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    textAlign: "center",
    transition: theme.transitions.normal,
  },
  featureIcon: {
    fontSize: theme.typography.fontSize["5xl"],
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  featureDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  ctaSection: {
    background: theme.colors.primary,
    color: theme.colors.white,
    padding: `${theme.spacing["3xl"]} ${theme.spacing.lg}`,
    textAlign: "center",
  },
  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  ctaSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.xl,
    opacity: 0.9,
  },
  ctaButtonLarge: {
    background: theme.colors.white,
    color: theme.colors.primary,
    padding: `${theme.spacing.lg} ${theme.spacing["2xl"]}`,
    borderRadius: theme.borderRadius.lg,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xl,
    display: "inline-block",
    transition: theme.transitions.fast,
  },
  footer: {
    background: theme.colors.gray900,
    color: theme.colors.white,
    padding: theme.spacing.xl,
    textAlign: "center",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
};
