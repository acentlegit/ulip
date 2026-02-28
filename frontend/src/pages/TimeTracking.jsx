import { useEffect, useState } from "react";
import axios from "axios";

export default function TimeTracking() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/time-tracking");
      setEntries(res.data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading time entries...</div>;

  return (
    <div style={styles.container}>
      <h1>Time Tracking</h1>
      <div style={styles.entriesList}>
        {entries.map((entry) => (
          <div key={entry.id} style={styles.entryCard}>
            <div>
              <h3>{entry.description}</h3>
              <p>{entry.case?.title || "No case"}</p>
            </div>
            <div style={styles.entryMeta}>
              <span>{entry.hours} hours</span>
              {entry.amount && <span>${entry.amount.toFixed(2)}</span>}
              <span>{entry.billable ? "Billable" : "Non-billable"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  entriesList: { display: "flex", flexDirection: "column", gap: "12px" },
  entryCard: { background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between" },
  entryMeta: { display: "flex", flexDirection: "column", gap: "4px", textAlign: "right", fontSize: "14px", color: "#666" }
};
