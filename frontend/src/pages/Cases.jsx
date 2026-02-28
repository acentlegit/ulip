import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    description: "",
    caseNumber: "",
    practiceArea: "",
    priority: "MEDIUM"
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
    fetchClients();
  }, [statusFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      
      const res = await axios.get("http://localhost:5000/api/cases", { params });
      setCases(res.data);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients([]); // Set empty array on error
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Real-time search after 500ms delay
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchCases();
    }, 500);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    // Automatically fetch when filter changes (already handled by useEffect)
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId) {
      alert("Please fill in title and select a client");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/api/cases", formData);
      setShowModal(false);
      setFormData({
        title: "",
        clientId: "",
        description: "",
        caseNumber: "",
        practiceArea: "",
        priority: "MEDIUM"
      });
      fetchCases(); // Refresh the list
      navigate(`/cases/${res.data.id}`); // Navigate to the new case
    } catch (error) {
      console.error("Failed to create case:", error);
      alert(error.response?.data?.error || "Failed to create case");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && cases.length === 0) {
    return <div style={styles.loading}>Loading cases...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>Cases</h1>
        <button 
          onClick={() => setShowModal(true)} 
          style={styles.newButton}
          onMouseEnter={(e) => e.target.style.background = "#333"}
          onMouseLeave={(e) => e.target.style.background = "#1a1a1a"}
        >
          + New Case
        </button>
      </div>

      <div style={styles.filters}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          <button 
            type="submit" 
            style={styles.searchButton}
            onMouseEnter={(e) => e.target.style.background = "#333"}
            onMouseLeave={(e) => e.target.style.background = "#1a1a1a"}
          >
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          style={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CLOSED">Closed</option>
          <option value="ON_HOLD">On Hold</option>
        </select>
      </div>

      {cases.length > 0 ? (
        <div style={styles.casesGrid}>
          {cases.map((case_) => (
            <Link
              key={case_.id}
              to={`/cases/${case_.id}`}
              style={styles.caseCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              <div style={styles.caseHeader}>
                <h3 style={styles.caseHeaderH3}>{case_.title}</h3>
                <span
                  style={{
                    ...styles.status,
                    ...getStatusColor(case_.status)
                  }}
                >
                  {case_.status.replace("_", " ")}
                </span>
              </div>
              <p style={styles.caseNumber}>
                {case_.caseNumber || "No case number"}
              </p>
              <p style={styles.clientName}>
                Client: {case_.client?.name || "N/A"}
              </p>
              <div style={styles.caseMeta}>
                <span>📄 {case_._count?.documents || 0} docs</span>
                <span>✓ {case_._count?.tasks || 0} tasks</span>
                <span>⏱️ {case_._count?.timeEntries || 0} entries</span>
              </div>
              <p style={styles.caseDate}>
                Updated: {new Date(case_.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={styles.emptyP}>No cases found</p>
          <button 
            onClick={() => setShowModal(true)} 
            style={styles.newButton}
            onMouseEnter={(e) => e.target.style.background = "#333"}
            onMouseLeave={(e) => e.target.style.background = "#1a1a1a"}
          >
            Create Your First Case
          </button>
        </div>
      )}

      {/* Create Case Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Case</h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCase} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Case Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Enter case title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  style={styles.input}
                  disabled={clients.length === 0}
                >
                  <option value="">
                    {clients.length === 0 ? "No clients available - Create one first" : "Select a client"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Case Number</label>
                <input
                  type="text"
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  style={styles.input}
                  placeholder="Optional case number"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Practice Area</label>
                <select
                  value={formData.practiceArea}
                  onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select practice area</option>
                  <option value="LITIGATION">Litigation</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="REAL_ESTATE">Real Estate</option>
                  <option value="FAMILY_LAW">Family Law</option>
                  <option value="CRIMINAL">Criminal</option>
                  <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
                  <option value="EMPLOYMENT">Employment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={styles.input}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.input, minHeight: "100px", resize: "vertical" }}
                  placeholder="Case description (optional)"
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => e.target.style.background = "#e5e5e5"}
                  onMouseLeave={(e) => e.target.style.background = "#f5f5f5"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...styles.submitButton,
                    ...(submitting ? { background: "#999", cursor: "not-allowed" } : {})
                  }}
                  onMouseEnter={(e) => !submitting && (e.target.style.background = "#333")}
                  onMouseLeave={(e) => !submitting && (e.target.style.background = "#1a1a1a")}
                >
                  {submitting ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    OPEN: { background: "#e3f2fd", color: "#1976d2" },
    IN_PROGRESS: { background: "#fff3e0", color: "#f57c00" },
    CLOSED: { background: "#e8f5e9", color: "#388e3c" },
    ON_HOLD: { background: "#fce4ec", color: "#c2185b" }
  };
  return colors[status] || { background: "#f5f5f5", color: "#666" };
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto"
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  headerH1: {
    fontSize: "32px",
    color: "#333"
  },
  newButton: {
    padding: "12px 24px",
    background: "#1a1a1a",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontWeight: "500",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  "newButton:hover": {
    background: "#333"
  },
  filters: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    alignItems: "center"
  },
  searchForm: {
    display: "flex",
    flex: 1,
    gap: "8px"
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px"
  },
  searchButton: {
    padding: "12px 24px",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background 0.2s"
  },
  filterSelect: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    minWidth: "150px"
  },
  casesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px"
  },
  caseCard: {
    background: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textDecoration: "none",
    color: "inherit",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #e9ecef",
    display: "block"
  },
  caseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "12px"
  },
  caseHeaderH3: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    flex: 1
  },
  status: {
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    marginLeft: "12px",
    textTransform: "capitalize"
  },
  caseNumber: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px"
  },
  clientName: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
    marginBottom: "12px"
  },
  caseMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#999",
    marginBottom: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #e9ecef"
  },
  caseDate: {
    fontSize: "12px",
    color: "#999",
    margin: 0
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef"
  },
  emptyP: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "20px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalContent: {
    background: "white",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e9ecef"
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    margin: 0
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "32px",
    color: "#999",
    cursor: "pointer",
    padding: 0,
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1"
  },
  modalForm: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333"
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    outline: "none",
    fontFamily: "inherit"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px"
  },
  cancelButton: {
    padding: "12px 24px",
    background: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.2s"
  },
  submitButton: {
    padding: "12px 24px",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.2s"
  },
  noClients: {
    padding: "12px",
    background: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "4px",
    textAlign: "center",
    marginTop: "8px"
  },
  noClientsText: {
    margin: "0 0 12px 0",
    color: "#856404",
    fontSize: "14px"
  },
  createClientLink: {
    display: "inline-block",
    padding: "8px 16px",
    background: "#1a1a1a",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500"
  }
};
