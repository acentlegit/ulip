import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { getApiUrl } from "../config/api";
export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    type: "INDIVIDUAL",
    status: "ACTIVE",
    notes: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await axios.get(getApiUrl("clients"), { params });
      setClients(res.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Real-time search after 500ms delay
    clearTimeout(window.clientSearchTimeout);
    window.clientSearchTimeout = setTimeout(() => {
      fetchClients();
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients();
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please enter client name");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(getApiUrl("clients"), formData);
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        company: "",
        type: "INDIVIDUAL",
        status: "ACTIVE",
        notes: ""
      });
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error("Failed to create client:", error);
      alert(error.response?.data?.error || "Failed to create client");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && clients.length === 0) {
    return <div style={styles.loading}>Loading clients...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>Clients</h1>
        <button 
          onClick={() => setShowModal(true)} 
          style={styles.newButton}
        >
          + New Client
        </button>
      </div>
      <div style={styles.searchBar}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>Search</button>
        </form>
      </div>

      {clients.length > 0 ? (
        <div style={styles.clientsGrid}>
          {clients.map((client) => (
            <Link key={client.id} to={`/clients/${client.id}`} style={styles.clientCard}>
              <h3 style={styles.clientCardH3}>{client.name}</h3>
              {client.email && <p>📧 {client.email}</p>}
              {client.phone && <p>📞 {client.phone}</p>}
              <div style={styles.stats}>
                <span>📁 {client._count?.cases || 0} cases</span>
                <span>💰 {client._count?.invoices || 0} invoices</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={styles.emptyP}>No clients found</p>
          <button 
            onClick={() => setShowModal(true)} 
            style={styles.newButton}
          >
            Create Your First Client
          </button>
        </div>
      )}

      {/* Create Client Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Client</h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateClient} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Client Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Enter client name"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                    placeholder="client@example.com"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={styles.input}
                    placeholder="555-1234"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={styles.input}
                  placeholder="Company name (if applicable)"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="CORPORATE">Corporate</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.input}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PROSPECT">Prospect</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  placeholder="Client address (optional)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
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
                >
                  {submitting ? "Creating..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto", padding: "20px" },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px" },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: "24px" 
  },
  headerH1: { fontSize: "32px", color: "#333", margin: 0 },
  newButton: { 
    padding: "12px 24px", 
    background: "#667eea", 
    color: "white", 
    textDecoration: "none", 
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.2s"
  },
  searchBar: { 
    display: "flex", 
    gap: "8px", 
    marginBottom: "24px" 
  },
  searchForm: {
    display: "flex",
    gap: "8px",
    flex: 1
  },
  searchInput: { 
    flex: 1,
    padding: "12px", 
    border: "1px solid #ddd", 
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none"
  },
  searchButton: { 
    padding: "12px 24px", 
    background: "#667eea", 
    color: "white", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  clientsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: "20px" 
  },
  clientCard: { 
    background: "white", 
    padding: "24px", 
    borderRadius: "12px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
    textDecoration: "none", 
    color: "inherit",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #e9ecef"
  },
  clientCardH3: { 
    fontSize: "20px", 
    marginBottom: "12px", 
    color: "#333",
    marginTop: 0
  },
  stats: { 
    display: "flex", 
    gap: "16px", 
    marginTop: "12px", 
    fontSize: "14px", 
    color: "#666" 
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
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
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
    fontSize: "14px"
  },
  submitButton: {
    padding: "12px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px"
  }
};
