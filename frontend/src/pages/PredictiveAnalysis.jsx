import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, getApiUrl } from "../config/api";

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
  const [showFactorsModal, setShowFactorsModal] = useState(false);
  const [caseFactors, setCaseFactors] = useState({
    evidenceStrength: 0.7,
    judgeHistory: 0.6,
    similarCaseOutcomes: 0.65,
    clientHistory: 0.7,
    opposingCounselStrength: 0.5,
    jurisdiction: "STATE",
    notes: "",
  });
  const [savingFactors, setSavingFactors] = useState(false);

  const loadCaseFactors = useCallback(async (caseId) => {
    if (!caseId || !token) return;
    try {
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.get(getApiUrl(`case-factors/${caseId}`), config);
      if (response.data) {
        setCaseFactors({
          evidenceStrength: response.data.evidenceStrength ?? 0.7,
          judgeHistory: response.data.judgeHistory ?? 0.6,
          similarCaseOutcomes: response.data.similarCaseOutcomes ?? 0.65,
          clientHistory: response.data.clientHistory ?? 0.7,
          opposingCounselStrength: response.data.opposingCounselStrength ?? 0.5,
          jurisdiction: response.data.jurisdiction ?? "STATE",
          notes: response.data.notes ?? "",
        });
      }
    } catch (error) {
      console.error("Error loading case factors:", error);
      // Use defaults if factors don't exist
    }
  }, [token]);

  const saveCaseFactors = async () => {
    if (!selectedCase) return;
    
    setSavingFactors(true);
    try {
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      await axios.put(
        getApiUrl(`case-factors/${selectedCase}`),
        caseFactors,
        config
      );
      setShowFactorsModal(false);
      alert("Case factors saved successfully! Run prediction again to see updated results.");
    } catch (error) {
      console.error("Error saving case factors:", error);
      alert("Failed to save case factors: " + (error.response?.data?.error || error.message));
    } finally {
      setSavingFactors(false);
    }
  };

  const calculateClientHistory = async () => {
    if (!selectedCase) return;
    
    try {
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.get(
        getApiUrl(`case-factors/${selectedCase}/calculate-client-history`),
        config
      );
      
      if (response.data.clientHistory !== undefined) {
        setCaseFactors(prev => ({
          ...prev,
          clientHistory: response.data.clientHistory
        }));
        alert(`Client history calculated: ${(response.data.clientHistory * 100).toFixed(1)}% (from ${response.data.totalCases} past cases)`);
      }
    } catch (error) {
      console.error("Error calculating client history:", error);
      alert("Failed to calculate client history: " + (error.response?.data?.error || error.message));
    }
  };

  const fetchCases = useCallback(async () => {
    setLoadingCases(true);
    setError(null);
    try {
      console.log("Fetching cases from:", getApiUrl("predictive-analysis/cases"));
      console.log("Token available:", !!token);
      
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.get(getApiUrl("predictive-analysis/cases"), config);
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
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCases();
    } else {
      setLoadingCases(false);
    }
  }, [token, fetchCases]);

  const handlePredictOutcome = async () => {
    if (!selectedCase) {
      alert("Please select a case first");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.post(
        getApiUrl("predictive-analysis/predict-outcome"),
        { caseId: selectedCase },
        config
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
        // Map practiceArea to case type for analysis
        const practiceArea = (caseData.practiceArea || "").toUpperCase();
        let caseType = "CIVIL"; // Default
        if (practiceArea.includes("CRIMINAL")) {
          caseType = "CRIMINAL";
        } else if (practiceArea.includes("FAMILY") || practiceArea.includes("DIVORCE") || practiceArea.includes("CUSTODY")) {
          caseType = "FAMILY";
        }
        requestData.caseType = caseType;
        requestData.priority = caseData.priority || "MEDIUM";
      } else {
        // Default values if case not found in local state
        requestData.caseType = "CIVIL";
        requestData.priority = "MEDIUM";
      }

      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.post(
        getApiUrl("predictive-analysis/generate-strategy"),
        requestData,
        config
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
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.post(
        getApiUrl("predictive-analysis/risk-score"),
        { caseId: selectedCase },
        config
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
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Select Case</h2>
          <button
            onClick={fetchCases}
            disabled={loadingCases}
            style={{
              ...styles.refreshButton,
              ...(loadingCases && styles.refreshButtonDisabled)
            }}
            title="Refresh cases list"
            onMouseEnter={(e) => {
              if (!loadingCases) {
                e.target.style.backgroundColor = "#5568d3";
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingCases) {
                e.target.style.backgroundColor = "#667eea";
              }
            }}
          >
            {loadingCases ? "⏳" : "🔄"} Refresh
          </button>
        </div>
        {loadingCases ? (
          <div style={styles.loadingText}>Loading cases...</div>
        ) : (
          <>
            <select
              value={selectedCase || ""}
              onChange={async (e) => {
                setSelectedCase(e.target.value);
                setPrediction(null);
                setStrategy(null);
                setRiskScore(null);
                if (e.target.value) {
                  await loadCaseFactors(e.target.value);
                }
              }}
              style={styles.select}
              disabled={cases.length === 0}
            >
              <option value="">
                {cases.length === 0 ? "-- No cases available --" : "-- Select a case --"}
              </option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title} - {caseItem.practiceArea || "GENERAL"} ({caseItem.status || "OPEN"})
                </option>
              ))}
            </select>
            {cases.length === 0 && !error && (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No cases found. Create a case to get started with predictive analysis.</p>
                <Link to="/cases" style={styles.createCaseLink}>
                  ➕ Create New Case
                </Link>
              </div>
            )}
          </>
        )}
        {error && (
          <div style={styles.errorMessage}>
            ⚠️ {error}
            <button
              onClick={fetchCases}
              style={styles.retryButton}
            >
              Retry
            </button>
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
          {selectedCase && (
            <button
              onClick={() => setShowFactorsModal(true)}
              disabled={loading}
              style={{
                ...styles.actionButton,
                backgroundColor: "#10b981",
              }}
              title="Edit case factors for more accurate predictions"
            >
              ⚙️ Edit Factors
            </button>
          )}
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

      {/* Case Factors Modal */}
      {showFactorsModal && (
        <div style={styles.modalOverlay} onClick={() => setShowFactorsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>⚙️ Edit Case Factors</h2>
              <button
                onClick={() => setShowFactorsModal(false)}
                style={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <p style={styles.modalDescription}>
                Enter real data about this case to get more accurate predictions. 
                Values range from 0.0 (weak/poor) to 1.0 (strong/excellent).
              </p>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>
                  Evidence Strength: {(caseFactors.evidenceStrength * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={caseFactors.evidenceStrength}
                  onChange={(e) => setCaseFactors({...caseFactors, evidenceStrength: parseFloat(e.target.value)})}
                  style={styles.rangeInput}
                />
                <div style={styles.factorHint}>Quality and strength of evidence supporting your case</div>
              </div>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>
                  Judge History: {(caseFactors.judgeHistory * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={caseFactors.judgeHistory}
                  onChange={(e) => setCaseFactors({...caseFactors, judgeHistory: parseFloat(e.target.value)})}
                  style={styles.rangeInput}
                />
                <div style={styles.factorHint}>Historical favorability of the assigned judge</div>
              </div>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>
                  Similar Case Outcomes: {(caseFactors.similarCaseOutcomes * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={caseFactors.similarCaseOutcomes}
                  onChange={(e) => setCaseFactors({...caseFactors, similarCaseOutcomes: parseFloat(e.target.value)})}
                  style={styles.rangeInput}
                />
                <div style={styles.factorHint}>Success rate of similar cases in your jurisdiction</div>
              </div>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>
                  Client History: {(caseFactors.clientHistory * 100).toFixed(0)}%
                </label>
                <div style={styles.factorRow}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={caseFactors.clientHistory}
                    onChange={(e) => setCaseFactors({...caseFactors, clientHistory: parseFloat(e.target.value)})}
                    style={{...styles.rangeInput, flex: 1}}
                  />
                  <button
                    onClick={calculateClientHistory}
                    style={styles.calculateButton}
                    title="Calculate from past cases"
                  >
                    📊 Auto
                  </button>
                </div>
                <div style={styles.factorHint}>Client's historical case success rate (click Auto to calculate from past cases)</div>
              </div>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>
                  Opposing Counsel Strength: {(caseFactors.opposingCounselStrength * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={caseFactors.opposingCounselStrength}
                  onChange={(e) => setCaseFactors({...caseFactors, opposingCounselStrength: parseFloat(e.target.value)})}
                  style={styles.rangeInput}
                />
                <div style={styles.factorHint}>Perceived strength and experience of opposing counsel</div>
              </div>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>Jurisdiction</label>
                <select
                  value={caseFactors.jurisdiction}
                  onChange={(e) => setCaseFactors({...caseFactors, jurisdiction: e.target.value})}
                  style={styles.select}
                >
                  <option value="STATE">State Court</option>
                  <option value="FEDERAL">Federal Court</option>
                </select>
              </div>

              <div style={styles.factorGroup}>
                <label style={styles.factorLabel}>Notes (optional)</label>
                <textarea
                  value={caseFactors.notes}
                  onChange={(e) => setCaseFactors({...caseFactors, notes: e.target.value})}
                  style={styles.textarea}
                  placeholder="Add any additional notes about these factors..."
                  rows={3}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowFactorsModal(false)}
                style={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button
                onClick={saveCaseFactors}
                disabled={savingFactors}
                style={styles.modalSaveButton}
              >
                {savingFactors ? "Saving..." : "💾 Save Factors"}
              </button>
            </div>
          </div>
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
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#333",
  },
  refreshButton: {
    padding: "6px 12px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  refreshButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    backgroundColor: "#9ca3af",
  },
  retryButton: {
    marginLeft: "10px",
    padding: "4px 12px",
    fontSize: "12px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  emptyState: {
    marginTop: "15px",
    padding: "20px",
    textAlign: "center",
    background: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  emptyText: {
    margin: "0 0 15px 0",
    color: "#666",
    fontSize: "14px",
  },
  createCaseLink: {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: "#1a1a2e",
  },
  modalCloseButton: {
    background: "none",
    border: "none",
    fontSize: "32px",
    color: "#666",
    cursor: "pointer",
    padding: 0,
    width: "32px",
    height: "32px",
    lineHeight: "32px",
  },
  modalBody: {
    padding: "20px",
  },
  modalDescription: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  factorGroup: {
    marginBottom: "20px",
  },
  factorLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  factorRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  rangeInput: {
    width: "100%",
    height: "8px",
    borderRadius: "4px",
    background: "#e5e7eb",
    outline: "none",
    cursor: "pointer",
  },
  factorHint: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
    fontStyle: "italic",
  },
  calculateButton: {
    padding: "6px 12px",
    fontSize: "12px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "20px",
    borderTop: "1px solid #e5e7eb",
  },
  modalCancelButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#f3f4f6",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  modalSaveButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
