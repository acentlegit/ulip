import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { isAdminRole } from "../constants/roles";

import { getApiUrl } from "../config/api";
export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [case_, setCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const res = await axios.get(getApiUrl("cases/${id}"));
      setCase(res.data);
    } catch (error) {
      console.error("Failed to fetch case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${case_.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(getApiUrl("cases/${id}"));
      navigate("/cases");
    } catch (error) {
      console.error("Failed to delete case:", error);
      alert(error.response?.data?.error || "Failed to delete case. Only Organization Admins can delete cases.");
      setDeleting(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading case...</div>;
  if (!case_) return <div>Case not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/cases" style={styles.backLink}>← Back to Cases</Link>
        <div style={styles.headerRight}>
          <span
            style={{
              ...styles.statusBadge,
              ...getStatusColor(case_.status)
            }}
          >
            {case_.status.replace("_", " ")}
          </span>
          {isAdminRole(user?.role) && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                ...styles.deleteButton,
                ...(deleting ? { opacity: 0.6, cursor: "not-allowed" } : {})
              }}
            >
              {deleting ? "Deleting..." : "🗑️ Delete Case"}
            </button>
          )}
        </div>
      </div>

      <div style={styles.titleSection}>
        <h1 style={styles.titleSectionH1}>{case_.title}</h1>
        <p style={styles.caseNumber}>
          {case_.caseNumber || "No case number"} • Client: {case_.client?.name}
        </p>
      </div>

      <div style={styles.tabs}>
        {["overview", "documents", "tasks", "notes", "timeline", "billing"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "overview" && (
          <div>
            <div style={styles.infoGrid}>
              <InfoCard title="Status" value={case_.status.replace("_", " ")} />
              <InfoCard title="Practice Area" value={case_.practiceArea || "N/A"} />
              <InfoCard title="Priority" value={case_.priority} />
              <InfoCard title="Opened" value={new Date(case_.openedDate).toLocaleDateString()} />
            </div>
            {case_.description && (
              <div style={styles.section}>
                <h3 style={styles.sectionH3}>Description</h3>
                <p>{case_.description}</p>
              </div>
            )}
            <div style={styles.section}>
              <h3 style={styles.sectionH3}>Team Members</h3>
              <div style={styles.membersList}>
                {case_.members?.map((member) => (
                  <div key={member.id} style={styles.member}>
                    {member.user.name} - {member.role.replace("_", " ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div>
            <h3 style={styles.sectionH3}>Documents ({case_.documents?.length || 0})</h3>
            <div style={styles.list}>
              {case_.documents?.map((doc) => (
                <div key={doc.id} style={styles.listItem}>
                  <span>📄 {doc.fileName}</span>
                  <span style={styles.date}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h3 style={styles.sectionH3}>Tasks ({case_.tasks?.length || 0})</h3>
            <div style={styles.list}>
              {case_.tasks?.map((task) => (
                <div key={task.id} style={styles.listItem}>
                  <div>
                    <strong>{task.title}</strong>
                    {task.assignee && <span> • Assigned to: {task.assignee.name}</span>}
                  </div>
                  <span style={styles.date}>
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <h3 style={styles.sectionH3}>Notes ({case_.notes?.length || 0})</h3>
            <div style={styles.list}>
              {case_.notes?.map((note) => (
                <div key={note.id} style={styles.noteCard}>
                  <p style={styles.noteCardP}>{note.content}</p>
                  <span style={styles.date}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div>
            <h3 style={styles.sectionH3}>Timeline</h3>
            <div style={styles.timeline}>
              {case_.timeline?.map((event) => (
                <div key={event.id} style={styles.timelineItem}>
                  <div style={styles.timelineDot}></div>
                  <div style={styles.timelineContent}>
                    <strong>{event.title}</strong>
                    {event.description && <p>{event.description}</p>}
                    <span style={styles.date}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div>
            <h3 style={styles.sectionH3}>Billing Summary</h3>
            <p>Time Entries: {case_._count?.timeEntries || 0}</p>
            <p>Invoices: {case_._count?.invoices || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoTitle}>{title}</div>
      <div style={styles.infoValue}>{value}</div>
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
    maxWidth: "1200px",
    margin: "0 auto"
  },
  loading: {
    textAlign: "center",
    padding: "40px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  backLink: {
    color: "#667eea",
    textDecoration: "none",
    fontSize: "14px"
  },
  headerRight: {
    display: "flex",
    gap: "12px"
  },
  statusBadge: {
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    textTransform: "capitalize"
  },
  titleSection: {
    marginBottom: "24px"
  },
  titleSectionH1: {
    fontSize: "32px",
    color: "#333",
    marginBottom: "8px"
  },
  caseNumber: {
    fontSize: "16px",
    color: "#666"
  },
  tabs: {
    display: "flex",
    gap: "8px",
    borderBottom: "2px solid #e9ecef",
    marginBottom: "24px"
  },
  tab: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#666",
    marginBottom: "-2px"
  },
  tabActive: {
    color: "#667eea",
    borderBottomColor: "#667eea"
  },
  content: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  infoCard: {
    padding: "16px",
    background: "#f8f9fa",
    borderRadius: "8px"
  },
  infoTitle: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "4px"
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333"
  },
  section: {
    marginBottom: "24px"
  },
  sectionH3: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "12px"
  },
  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  member: {
    padding: "8px 12px",
    background: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "6px"
  },
  noteCard: {
    padding: "16px",
    background: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "12px"
  },
  noteCardP: {
    marginBottom: "8px"
  },
  date: {
    fontSize: "12px",
    color: "#999"
  },
  timeline: {
    position: "relative",
    paddingLeft: "30px"
  },
  timelineItem: {
    position: "relative",
    paddingBottom: "24px"
  },
  timelineDot: {
    position: "absolute",
    left: "-38px",
    top: "4px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#667eea",
    border: "3px solid white",
    boxShadow: "0 0 0 3px #667eea"
  },
  timelineContent: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "6px"
  },
  deleteButton: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.2s"
  }
};
