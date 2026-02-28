import { useEffect, useState } from "react";
import axios from "axios";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/documents");
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>Documents</h1>
        <button style={styles.uploadButton}>+ Upload Document</button>
      </div>
      <div style={styles.documentsList}>
        {documents.map((doc) => (
          <div key={doc.id} style={styles.documentCard}>
            <div style={styles.docIcon}>📄</div>
            <div style={styles.docInfo}>
              <h3 style={styles.docInfoH3}>{doc.fileName}</h3>
              <p style={styles.docInfoP}>{doc.description || "No description"}</p>
              <p style={styles.docMeta}>
                Uploaded by {doc.uploader?.name} • {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={styles.docSize}>{(doc.fileSize / 1024).toFixed(2)} KB</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  headerH1: { fontSize: "32px", color: "#333" },
  uploadButton: { padding: "12px 24px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  documentsList: { display: "flex", flexDirection: "column", gap: "12px" },
  documentCard: { background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "16px" },
  docIcon: { fontSize: "32px" },
  docInfo: { flex: 1 },
  docInfoH3: { margin: "0 0 8px 0", color: "#333" },
  docInfoP: { margin: "4px 0", color: "#666", fontSize: "14px" },
  docMeta: { fontSize: "12px", color: "#999" },
  docSize: { color: "#666", fontSize: "14px" }
};
