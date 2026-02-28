import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Use the same API URL pattern as Cases.jsx
const API_BASE = "http://localhost:5000";

export default function PredictiveAnalysis() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCases, setLoadingCases] = useState(true);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [activeTab, setActiveTab] = useState("predict");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCases();
    } else {
      setLoadingCases(false);
    }
  }, [token]);

  const fetchCases = async () => {
    setLoadingCases(true);
    setError(null);
    try {
      console.log("Fetching cases from:", `${API_BASE}/api/predictive-analysis/cases`);
      const response = await axios.get(`${API_BASE}/api/predictive-analysis/cases`);
      console.log("API Response:", response);
      console.log("Cases data:", response.data);
      console.log("Cases count:", response.data?.length);
      
      // Handle both array and object responses
      const casesData = Array.isArray(response.data) ? response.data : (response.data?.cases || []);
      setCases(casesData);
      
      if (casesData.length === 0) {
        console.log("No cases found in response");
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to load cases. Please try again.";
      setError(errorMessage);
      setCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  const handlePredictOutcome = async () => {
    if (!selectedCase) {
      alert("Please select a case first");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await axios.post(
        `${API_BASE}/api/predictive-analysis/predict-outcome`,
        { caseId: selectedCase }
      );
      setPrediction(response.data);
      setActiveTab("predict");
      setStrategy(null);
      setRiskScore(null);
    } catch (error) {
      console.error("Prediction error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to generate prediction. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!selectedCase) {
      alert("Please select a case first");
      return;
    }

    const caseData = cases.find((c) => c.id === selectedCase);
    
    setLoading(true);
    setError(null);
    setStrategy(null);
    try {
      const requestData = {
        caseId: selectedCase,
      };
      
      // Add case type and priority if available
      if (caseData) {
        requestData.caseType = caseData.type || "CIVIL";
        requestData.priority = caseData.priority || "MEDIUM";
      } else {
        // Default values if case not found in local state
        requestData.caseType = "CIVIL";
        requestData.priority = "MEDIUM";
      }

      const response = await axios.post(
        `${API_BASE}/api/predictive-analysis/generate-strategy`,
        requestData
      );
      setStrategy(response.data);
      setActiveTab("strategy");
      setPrediction(null);
      setRiskScore(null);
    } catch (error) {
      console.error("Strategy generation error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to generate strategy. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRisk = async () => {
    if (!selectedCase) {
      alert("Please select a case first");
      return;
    }

    setLoading(true);
    setError(null);
    setRiskScore(null);
    try {
      const response = await axios.post(
        `${API_BASE}/api/predictive-analysis/risk-score`,
        { caseId: selectedCase }
      );
      setRiskScore(response.data);
      setActiveTab("risk");
      setPrediction(null);
      setStrategy(null);
    } catch (error) {
      console.error("Risk calculation error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to calculate risk score. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getWinProbabilityColor = (probability) => {
    if (probability >= 0.7) return "#10b981"; // green
    if (probability >= 0.5) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "#ef4444";
      case "HIGH":
        return "#f59e0b";
      case "MEDIUM":
        return "#3b82f6";
      case "LOW":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🤖 Predictive Analysis</h1>
          <p style={styles.subtitle}>
            AI-driven predictive analytics for case outcomes, legal strategy, and risk assessment
          </p>
        </div>
      </div>

      {/* Case Selection */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Select Case</h2>
        {loadingCases ? (
          <div style={styles.loadingText}>Loading cases...</div>
        ) : (
          <select
            value={selectedCase || ""}
            onChange={(e) => {
              setSelectedCase(e.target.value);
              setPrediction(null);
              setStrategy(null);
              setRiskScore(null);
            }}
            style={styles.select}
            disabled={cases.length === 0}
          >
            <option value="">
              {cases.length === 0 ? "-- No cases available --" : "-- Select a case --"}
            </option>
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.title} - {caseItem.type || "CIVIL"} ({caseItem.status || "ACTIVE"})
              </option>
            ))}
          </select>
        )}
        {error && (
          <div style={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!loadingCases && (
        <div style={styles.actions}>
          <button
            onClick={handlePredictOutcome}
            disabled={!selectedCase || loading}
            style={{
              ...styles.actionButton,
              ...((!selectedCase || loading) && styles.actionButtonDisabled),
            }}
          >
            📊 Predict Outcome
          </button>
          <button
            onClick={handleGenerateStrategy}
            disabled={!selectedCase || loading}
            style={{
              ...styles.actionButton,
              ...((!selectedCase || loading) && styles.actionButtonDisabled),
            }}
          >
            🎯 Generate Strategy
          </button>
          <button
            onClick={handleCalculateRisk}
            disabled={!selectedCase || loading}
            style={{
              ...styles.actionButton,
              ...((!selectedCase || loading) && styles.actionButtonDisabled),
            }}
          >
            ⚠️ Calculate Risk Score
          </button>
        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner}></div>
          </div>
          <p>Analyzing case data...</p>
        </div>
      )}

      {/* Prediction Results */}
      {prediction && activeTab === "predict" && (
        <div style={styles.resultCard}>
          <h2 style={styles.resultTitle}>📊 Case Outcome Prediction</h2>
          <div style={styles.predictionGrid}>
            <div style={styles.predictionItem}>
              <div style={styles.predictionLabel}>Win Probability</div>
              <div
                style={{
                  ...styles.predictionValue,
                  color: getWinProbabilityColor(prediction.winProbability),
                }}
              >
                {(prediction.winProbability * 100).toFixed(1)}%
              </div>
              <div style={styles.predictionBar}>
                <div
                  style={{
                    width: `${prediction.winProbability * 100}%`,
                    height: "8px",
                    background: getWinProbabilityColor(prediction.winProbability),
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
            </div>

            <div style={styles.predictionItem}>
              <div style={styles.predictionLabel}>Risk Score</div>
              <div style={styles.predictionValue}>{prediction.riskScore}/100</div>
            </div>

            <div style={styles.predictionItem}>
              <div style={styles.predictionLabel}>Recommended Settlement</div>
              <div style={styles.predictionValue}>
                ${prediction.recommendedSettlement.toLocaleString()}
              </div>
            </div>

            <div style={styles.predictionItem}>
              <div style={styles.predictionLabel}>Confidence Level</div>
              <div style={styles.predictionValue}>{prediction.confidence}</div>
            </div>

            <div style={styles.predictionItem}>
              <div style={styles.predictionLabel}>Estimated Trial Duration</div>
              <div style={styles.predictionValue}>{prediction.estimatedTrialDuration} days</div>
            </div>

            <div style={styles.predictionItem}>
              <div style={styles.predictionLabel}>Estimated Cost</div>
              <div style={styles.predictionValue}>
                ${prediction.estimatedCost.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={styles.recommendations}>
            <h3 style={styles.recommendationsTitle}>💡 Recommendations</h3>
            <ul style={styles.recommendationsList}>
              {prediction.recommendations.map((rec, index) => (
                <li key={index} style={styles.recommendationItem}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Strategy Results */}
      {strategy && activeTab === "strategy" && (
        <div style={styles.resultCard}>
          <h2 style={styles.resultTitle}>🎯 AI Legal Strategy Generator</h2>
          <div style={styles.strategyInfo}>
            <div style={styles.strategyItem}>
              <strong>Case Type:</strong> {strategy.caseType}
            </div>
            <div style={styles.strategyItem}>
              <strong>Priority:</strong> {strategy.priority}
            </div>
            <div style={styles.strategyItem}>
              <strong>Estimated Effort:</strong> {strategy.estimatedEffort}
            </div>
          </div>

          <div style={styles.strategySection}>
            <h3 style={styles.strategySectionTitle}>Immediate Actions</h3>
            <ul style={styles.strategyList}>
              {strategy.timeline.immediate.map((action, index) => (
                <li key={index} style={styles.strategyListItem}>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.strategySection}>
            <h3 style={styles.strategySectionTitle}>Short-Term Strategy</h3>
            <ul style={styles.strategyList}>
              {strategy.timeline.shortTerm.map((action, index) => (
                <li key={index} style={styles.strategyListItem}>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {strategy.timeline.longTerm.length > 0 && (
            <div style={styles.strategySection}>
              <h3 style={styles.strategySectionTitle}>Long-Term Strategy</h3>
              <ul style={styles.strategyList}>
                {strategy.timeline.longTerm.map((action, index) => (
                  <li key={index} style={styles.strategyListItem}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Risk Score Results */}
      {riskScore && activeTab === "risk" && (
        <div style={styles.resultCard}>
          <h2 style={styles.resultTitle}>⚠️ Legal Risk Scoring</h2>
          <div style={styles.riskHeader}>
            <div style={styles.riskScoreMain}>
              <div style={styles.riskScoreLabel}>Total Risk Score</div>
              <div
                style={{
                  ...styles.riskScoreValue,
                  color: getRiskLevelColor(riskScore.riskLevel),
                }}
              >
                {riskScore.totalRiskScore}/100
              </div>
              <div
                style={{
                  ...styles.riskLevel,
                  backgroundColor: getRiskLevelColor(riskScore.riskLevel),
                }}
              >
                {riskScore.riskLevel}
              </div>
            </div>
          </div>

          <div style={styles.riskBreakdown}>
            <h3 style={styles.riskBreakdownTitle}>Risk Breakdown</h3>
            <div style={styles.riskFactors}>
              <div style={styles.riskFactor}>
                <div style={styles.riskFactorLabel}>Financial Risk</div>
                <div style={styles.riskFactorBar}>
                  <div
                    style={{
                      width: `${riskScore.riskBreakdown.financial}%`,
                      height: "20px",
                      background: "#ef4444",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <div style={styles.riskFactorValue}>{riskScore.riskBreakdown.financial}%</div>
              </div>

              <div style={styles.riskFactor}>
                <div style={styles.riskFactorLabel}>Evidence Risk</div>
                <div style={styles.riskFactorBar}>
                  <div
                    style={{
                      width: `${riskScore.riskBreakdown.evidence}%`,
                      height: "20px",
                      background: "#f59e0b",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <div style={styles.riskFactorValue}>{riskScore.riskBreakdown.evidence}%</div>
              </div>

              <div style={styles.riskFactor}>
                <div style={styles.riskFactorLabel}>Precedent Risk</div>
                <div style={styles.riskFactorBar}>
                  <div
                    style={{
                      width: `${riskScore.riskBreakdown.precedent}%`,
                      height: "20px",
                      background: "#3b82f6",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <div style={styles.riskFactorValue}>{riskScore.riskBreakdown.precedent}%</div>
              </div>

              <div style={styles.riskFactor}>
                <div style={styles.riskFactorLabel}>Cooperation Risk</div>
                <div style={styles.riskFactorBar}>
                  <div
                    style={{
                      width: `${riskScore.riskBreakdown.cooperation}%`,
                      height: "20px",
                      background: "#8b5cf6",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <div style={styles.riskFactorValue}>{riskScore.riskBreakdown.cooperation}%</div>
              </div>

              <div style={styles.riskFactor}>
                <div style={styles.riskFactorLabel}>Opposition Risk</div>
                <div style={styles.riskFactorBar}>
                  <div
                    style={{
                      width: `${riskScore.riskBreakdown.opposition}%`,
                      height: "20px",
                      background: "#ec4899",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <div style={styles.riskFactorValue}>{riskScore.riskBreakdown.opposition}%</div>
              </div>
            </div>
          </div>

          {riskScore.mitigation.length > 0 && (
            <div style={styles.mitigation}>
              <h3 style={styles.mitigationTitle}>🛡️ Risk Mitigation Recommendations</h3>
              <ul style={styles.mitigationList}>
                {riskScore.mitigation.map((item, index) => (
                  <li key={index} style={styles.mitigationItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: 0,
  },
  section: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#333",
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "white",
  },
  actions: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  actionButton: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  actionButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    backgroundColor: "#9ca3af",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
  resultCard: {
    background: "white",
    padding: "30px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  resultTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 20px 0",
    color: "#1a1a2e",
  },
  predictionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  predictionItem: {
    padding: "20px",
    background: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  predictionLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px",
  },
  predictionValue: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  predictionBar: {
    width: "100%",
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  recommendations: {
    marginTop: "30px",
    padding: "20px",
    background: "#f0f9ff",
    borderRadius: "8px",
    border: "1px solid #bae6fd",
  },
  recommendationsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#0369a1",
  },
  recommendationsList: {
    margin: 0,
    paddingLeft: "20px",
  },
  recommendationItem: {
    marginBottom: "10px",
    color: "#0c4a6e",
    lineHeight: "1.6",
  },
  strategyInfo: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  strategyItem: {
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "6px",
    fontSize: "14px",
  },
  strategySection: {
    marginBottom: "25px",
  },
  strategySectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#333",
  },
  strategyList: {
    margin: 0,
    paddingLeft: "20px",
  },
  strategyListItem: {
    marginBottom: "10px",
    color: "#555",
    lineHeight: "1.6",
  },
  riskHeader: {
    marginBottom: "30px",
  },
  riskScoreMain: {
    textAlign: "center",
    padding: "30px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  riskScoreLabel: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "10px",
  },
  riskScoreValue: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  riskLevel: {
    display: "inline-block",
    padding: "8px 20px",
    borderRadius: "20px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
  },
  riskBreakdown: {
    marginBottom: "30px",
  },
  riskBreakdownTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    color: "#333",
  },
  riskFactors: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  riskFactor: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 60px",
    gap: "15px",
    alignItems: "center",
  },
  riskFactorLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  riskFactorBar: {
    flex: 1,
    height: "20px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  riskFactorValue: {
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "right",
    color: "#333",
  },
  mitigation: {
    marginTop: "30px",
    padding: "20px",
    background: "#fef3c7",
    borderRadius: "8px",
    border: "1px solid #fcd34d",
  },
  mitigationTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#92400e",
  },
  mitigationList: {
    margin: 0,
    paddingLeft: "20px",
  },
  mitigationItem: {
    marginBottom: "10px",
    color: "#78350f",
    lineHeight: "1.6",
  },
  infoCard: {
    background: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginTop: "20px",
  },
  infoTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#1a1a2e",
  },
  infoText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    marginBottom: "15px",
  },
  infoList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#555",
  },
  infoListItem: {
    marginBottom: "10px",
    lineHeight: "1.6",
  },
  loadingText: {
    padding: "20px",
    textAlign: "center",
    color: "#666",
    fontSize: "16px",
  },
  emptyState: {
    padding: "30px",
    textAlign: "center",
    background: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  linkButton: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  errorMessage: {
    marginTop: "15px",
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    fontSize: "14px",
  },
};
