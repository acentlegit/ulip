import { useEffect, useState } from "react";
import axios from "axios";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/calendar");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div style={styles.container}>
      <h1>Calendar</h1>
      <div style={styles.eventsList}>
        {events.map((event) => (
          <div key={event.id} style={styles.eventCard}>
            <div style={styles.eventIcon}>
              {event.type === "HEARING" ? "⚖️" : event.type === "TASK" ? "✓" : "💰"}
            </div>
            <div style={styles.eventInfo}>
              <h3 style={styles.eventInfoH3}>{event.title}</h3>
              <p style={styles.eventInfoP}>{new Date(event.date).toLocaleString()}</p>
              {event.location && <p style={styles.eventInfoP}>📍 {event.location}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  eventsList: { display: "flex", flexDirection: "column", gap: "12px" },
  eventCard: { background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", gap: "16px" },
  eventIcon: { fontSize: "32px" },
  eventInfo: { flex: 1 },
  eventInfoH3: { margin: "0 0 8px 0", color: "#333" },
  eventInfoP: { margin: "4px 0", color: "#666", fontSize: "14px" }
};
