import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

export default function CaseTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "NOTE",
    eventDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchTimeline();
  }, [id]);

  const fetchTimeline = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cases/${id}`);
      setTimeline(res.data.timeline || []);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/cases/${id}/timeline`, formData);
      setShowAddForm(false);
      setFormData({ title: "", description: "", eventType: "NOTE", eventDate: new Date().toISOString().split("T")[0] });
      fetchTimeline();
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading timeline...</div>;

  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/cases/${id}`)} style={styles.backButton}>
          ← Back to Case
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Case Timeline</h1>
          <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
            + Add Event
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={styles.card}>
          <h2 style={styles.formTitle}>Add Timeline Event</h2>
          <form onSubmit={handleAddEvent} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Event Type *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  required
                  style={styles.select}
                >
                  <option value="FILING">Filing</option>
                  <option value="HEARING">Hearing</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="NOTE">Note</option>
                  <option value="DOCUMENT">Document</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Event Date *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={styles.textarea}
                rows={4}
              />
            </div>
            <div style={styles.formButtons}>
              <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>Add Event</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.timeline}>
        {sortedTimeline.map((event, index) => (
          <div key={event.id} style={styles.timelineItem}>
            <div style={styles.timelineDot}></div>
            <div style={styles.timelineContent}>
              <div style={styles.eventHeader}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <span style={styles.eventType}>{event.eventType}</span>
              </div>
              {event.description && <p style={styles.eventDescription}>{event.description}</p>}
              <span style={styles.eventDate}>
                {new Date(event.eventDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "1200px", margin: "0 auto" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: theme.typography.fontSize.xl },
  header: { marginBottom: theme.spacing.xl },
  backButton: { background: "none", border: "none", color: theme.colors.primary, cursor: "pointer", fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing.md, padding: 0 },
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  addButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  card: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.textPrimary },
  form: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  formRow: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: theme.spacing.lg },
  formGroup: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary },
  input: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base },
  select: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
  textarea: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, fontFamily: "inherit", resize: "vertical" },
  formButtons: { display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" },
  cancelButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.gray200, color: theme.colors.textPrimary, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer" },
  submitButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  timeline: { position: "relative", paddingLeft: theme.spacing["2xl"] },
  timelineItem: { position: "relative", paddingBottom: theme.spacing.xl },
  timelineDot: { position: "absolute", left: "-38px", top: "4px", width: "16px", height: "16px", borderRadius: "50%", background: theme.colors.primary, border: `4px solid ${theme.colors.white}`, boxShadow: `0 0 0 4px ${theme.colors.primary}` },
  timelineContent: { background: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  eventHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.sm },
  eventTitle: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary, margin: 0 },
  eventType: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.medium },
  eventDescription: { fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  eventDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textTertiary },
};
