import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";

export default function Pricing() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>⚖️</span>
            <span style={styles.logoText}>Legal Platform</span>
          </Link>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/register" style={styles.ctaButton}>Get Started</Link>
          </nav>
        </div>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Simple, Transparent Pricing</h1>
          <p style={styles.heroSubtitle}>Choose the plan that fits your practice</p>
        </div>
      </section>

      <section style={styles.pricing}>
        <div style={styles.pricingContent}>
          {pricingPlans.map((plan, index) => (
            <div key={index} style={{...styles.planCard, ...(plan.featured ? styles.planCardFeatured : {})}}>
              {plan.featured && <div style={styles.badge}>Most Popular</div>}
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.planPrice}>
                <span style={styles.priceAmount}>${plan.price}</span>
                <span style={styles.pricePeriod}>/month</span>
              </div>
              <p style={styles.planDescription}>{plan.description}</p>
              <ul style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={styles.featureItem}>
                    <span style={styles.checkIcon}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{...styles.planButton, ...(plan.featured ? styles.planButtonFeatured : {})}}>
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.faq}>
        <div style={styles.faqContent}>
          <h2 style={styles.faqTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} style={styles.faqItem}>
                <h3 style={styles.faqQuestion}>{faq.question}</h3>
                <p style={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for solo practitioners getting started",
    features: [
      "Up to 5 cases",
      "Basic client management",
      "Document storage (1GB)",
      "Email support",
      "Basic reporting"
    ],
    buttonText: "Start Free",
    featured: false
  },
  {
    name: "Basic",
    price: "49",
    description: "For small law firms",
    features: [
      "Unlimited cases",
      "Advanced client management",
      "Document storage (10GB)",
      "Time tracking",
      "Invoice generation",
      "Priority support",
      "Advanced reporting"
    ],
    buttonText: "Get Started",
    featured: true
  },
  {
    name: "Pro",
    price: "149",
    description: "For growing practices",
    features: [
      "Everything in Basic",
      "Unlimited document storage",
      "E-signature integration",
      "Calendar & deadline management",
      "Team collaboration",
      "Custom workflows",
      "API access",
      "24/7 support"
    ],
    buttonText: "Get Started",
    featured: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large law firms",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security",
      "SLA guarantees",
      "On-premise deployment",
      "Training & onboarding",
      "Custom development"
    ],
    buttonText: "Contact Sales",
    featured: false
  }
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, all paid plans come with a 14-day free trial. No credit card required."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, ACH transfers, and wire transfers for Enterprise plans."
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes, save 20% when you choose annual billing instead of monthly."
  }
];

const styles = {
  container: {
    minHeight: "100vh",
    background: theme.colors.bgSecondary,
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
  nav: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  navLink: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  ctaButton: {
    background: theme.colors.primary,
    color: theme.colors.white,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  hero: {
    padding: `${theme.spacing["3xl"]} ${theme.spacing.lg}`,
    textAlign: "center",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
  },
  pricing: {
    padding: `0 ${theme.spacing.lg} ${theme.spacing["3xl"]}`,
  },
  pricingContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: theme.spacing.xl,
  },
  planCard: {
    background: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.lg,
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  planCardFeatured: {
    border: `2px solid ${theme.colors.primary}`,
    transform: "scale(1.05)",
  },
  badge: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    background: theme.colors.primary,
    color: theme.colors.white,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  planName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  planPrice: {
    marginBottom: theme.spacing.md,
  },
  priceAmount: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  pricePeriod: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  planDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  featuresList: {
    listStyle: "none",
    flex: 1,
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  checkIcon: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.bold,
  },
  planButton: {
    background: theme.colors.gray200,
    color: theme.colors.textPrimary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    textAlign: "center",
    fontWeight: theme.typography.fontWeight.semibold,
    transition: theme.transitions.fast,
  },
  planButtonFeatured: {
    background: theme.colors.primary,
    color: theme.colors.white,
  },
  faq: {
    padding: `${theme.spacing["3xl"]} ${theme.spacing.lg}`,
    background: theme.colors.white,
  },
  faqContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  faqTitle: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: theme.spacing["2xl"],
    color: theme.colors.textPrimary,
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.xl,
  },
  faqItem: {
    padding: theme.spacing.lg,
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
  },
  faqQuestion: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  faqAnswer: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
};
