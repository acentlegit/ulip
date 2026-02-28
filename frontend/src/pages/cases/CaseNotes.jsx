import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

export default function CaseNotes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    isPrivate: false,
  });

  useEffect(() => {
    fetchNotes();
  }, [id]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cases/${id}`);
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/cases/${id}/notes`, formData);
      setShowAddForm(false);
      setFormData({ content: "", isPrivate: false });
      fetchNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading notes...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/cases/${id}`)} style={styles.backButton}>
          ← Back to Case
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Case Notes</h1>
          <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
            + Add Note
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={styles.card}>
          <h2 style={styles.formTitle}>Add New Note</h2>
          <form onSubmit={handleAddNote} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Note Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                style={styles.textarea}
                rows={6}
                placeholder="Enter your note here..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  style={styles.checkbox}
                />
                Private Note (only visible to you)
              </label>
            </div>
            <div style={styles.formButtons}>
              <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>Add Note</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.notesList}>
        {notes.map((note) => (
          <div key={note.id} style={styles.noteCard}>
            <div style={styles.noteHeader}>
              <div>
                <span style={styles.noteAuthor}>Created by: {note.createdBy}</span>
                {note.isPrivate && <span style={styles.privateBadge}>Private</span>}
              </div>
              <span style={styles.noteDate}>
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p style={styles.noteContent}>{note.content}</p>
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
  formGroup: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary },
  textarea: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, fontFamily: "inherit", resize: "vertical" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: theme.spacing.sm, fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary },
  checkbox: { width: "18px", height: "18px", cursor: "pointer" },
  formButtons: { display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" },
  cancelButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.gray200, color: theme.colors.textPrimary, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer" },
  submitButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
  notesList: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  noteCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md },
  noteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  noteAuthor: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginRight: theme.spacing.sm },
  privateBadge: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: theme.colors.warning, color: theme.colors.white, borderRadius: theme.borderRadius.full, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.medium },
  noteDate: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textTertiary },
  noteContent: { fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary, lineHeight: theme.typography.lineHeight.relaxed, whiteSpace: "pre-wrap" },
};
