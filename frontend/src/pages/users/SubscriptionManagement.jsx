import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

import { getApiUrl } from "../../config/api";
export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await axios.get(getApiUrl("auth/me"));
      if (res.data.user?.organization) {
        setSubscription(res.data.user.organization);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading subscription...</div>;
  if (!subscription) return <div>Subscription not found</div>;

  const tiers = {
    FREE: { name: "Free", features: ["5 cases", "Basic features", "Email support"] },
    BASIC: { name: "Basic", features: ["Unlimited cases", "Advanced features", "Priority support"] },
    PRO: { name: "Pro", features: ["Everything in Basic", "E-signatures", "API access", "24/7 support"] },
    ENTERPRISE: { name: "Enterprise", features: ["Everything in Pro", "Custom integrations", "Dedicated support", "SLA"] },
  };

  const currentTier = tiers[subscription.subscriptionTier] || tiers.FREE;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Subscription Management</h1>
        <Link to="/pricing" style={styles.upgradeButton}>
          Upgrade Plan
        </Link>
      </div>

      <div style={styles.currentPlan}>
        <h2 style={styles.planTitle}>Current Plan</h2>
        <div style={styles.planCard}>
          <div style={styles.planHeader}>
            <h3 style={styles.planName}>{currentTier.name}</h3>
            <span style={styles.planBadge}>{subscription.subscriptionTier}</span>
          </div>
          <ul style={styles.featuresList}>
            {currentTier.features.map((feature, index) => (
              <li key={index} style={styles.featureItem}>
                <span style={styles.checkIcon}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={styles.billingSection}>
        <h2 style={styles.sectionTitle}>Billing Information</h2>
        <div style={styles.billingCard}>
          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>Stripe Customer ID:</span>
            <span style={styles.billingValue}>
              {subscription.stripeCustomerId || "Not set"}
            </span>
          </div>
          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>Organization:</span>
            <span style={styles.billingValue}>{subscription.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1200px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing["2xl"] },
  title: { fontSize: theme.typography.fontSize["4xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  upgradeButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.md, textDecoration: "none", fontWeight: theme.typography.fontWeight.semibold },
  currentPlan: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, marginBottom: theme.spacing.xl },
  planTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  planCard: { background: theme.colors.bgSecondary, padding: theme.spacing.xl, borderRadius: theme.borderRadius.md },
  planHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.lg },
  planName: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, margin: 0 },
  planBadge: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  featuresList: { listStyle: "none", display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  featureItem: { display: "flex", alignItems: "center", gap: theme.spacing.sm, fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary },
  checkIcon: { color: theme.colors.success, fontWeight: theme.typography.fontWeight.bold },
  billingSection: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  sectionTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  billingCard: { background: theme.colors.bgSecondary, padding: theme.spacing.xl, borderRadius: theme.borderRadius.md },
  billingRow: { display: "flex", justifyContent: "space-between", padding: theme.spacing.md, borderBottom: `1px solid ${theme.colors.borderLight}` },
  billingLabel: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textSecondary },
  billingValue: { fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary },
};
