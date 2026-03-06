import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function UploadDocument() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fileName: "",
    description: "",
    category: "",
    tags: "",
    caseId: "",
    clientId: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0]) {
      setFormData({ ...formData, fileName: e.target.files[0].name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      Object.keys(formData).forEach((key) => {
        if (formData[key]) uploadData.append(key, formData[key]);
      });

      await axios.post(getApiUrl("documents/upload"), uploadData);
      navigate("/documents");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/documents")} style={styles.backButton}>
          ← Back to Documents
        </button>
        <h1 style={styles.title}>Upload Document</h1>
      </div>

      <div style={styles.card}>
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              style={styles.fileInput}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>File Name</label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                style={styles.input}
                placeholder="Auto-filled from file"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={styles.select}
              >
                <option value="">Select category</option>
                <option value="CONTRACT">Contract</option>
                <option value="PLEADING">Pleading</option>
                <option value="CORRESPONDENCE">Correspondence</option>
                <option value="EVIDENCE">Evidence</option>
                <option value="OTHER">Other</option>
              </select>
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              style={styles.input}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={() => navigate("/documents")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading || !file} style={styles.submitButton}>
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: theme.spacing.xl, maxWidth: "900px", margin: "0 auto" },
  header: { marginBottom: theme.spacing.xl },
  backButton: { background: "none", border: "none", color: theme.colors.primary, cursor: "pointer", fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing.md, padding: 0 },
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  card: { background: theme.colors.white, padding: theme.spacing["2xl"], borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.lg },
  error: { background: "#fef2f2", color: theme.colors.error, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg, border: `1px solid #fecaca` },
  form: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  formRow: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: theme.spacing.lg },
  formGroup: { display: "flex", flexDirection: "column", gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textPrimary },
  input: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base },
  fileInput: { padding: theme.spacing.sm, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base },
  select: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, background: theme.colors.white },
  textarea: { padding: theme.spacing.md, border: `1px solid ${theme.colors.borderLight}`, borderRadius: theme.borderRadius.md, fontSize: theme.typography.fontSize.base, fontFamily: "inherit", resize: "vertical" },
  buttons: { display: "flex", gap: theme.spacing.md, justifyContent: "flex-end", marginTop: theme.spacing.lg },
  cancelButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.gray200, color: theme.colors.textPrimary, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer" },
  submitButton: { padding: `${theme.spacing.md} ${theme.spacing.xl}`, background: theme.colors.primary, color: theme.colors.white, border: "none", borderRadius: theme.borderRadius.md, cursor: "pointer", fontWeight: theme.typography.fontWeight.semibold },
};
