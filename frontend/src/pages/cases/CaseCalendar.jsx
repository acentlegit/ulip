import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../../styles/theme";

import { getApiUrl } from "../../config/api";
export default function CaseCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [id]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(getApiUrl("cases/${id}"));
      setEvents(res.data.hearings || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading calendar...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/cases/${id}`)} style={styles.backButton}>
          ← Back to Case
        </button>
        <h1 style={styles.title}>Case Calendar</h1>
      </div>

      <div style={styles.eventsList}>
        {events.map((event) => (
          <div key={event.id} style={styles.eventCard}>
            <div style={styles.eventDate}>
              <div style={styles.dateDay}>
                {new Date(event.date).getDate()}
              </div>
              <div style={styles.dateMonth}>
                {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
              </div>
            </div>
            <div style={styles.eventContent}>
              <h3 style={styles.eventTitle}>{event.title}</h3>
              <p style={styles.eventType}>{event.type}</p>
              {event.location && <p style={styles.eventLocation}>📍 {event.location}</p>}
              {event.court && <p style={styles.eventCourt}>🏛️ {event.court}</p>}
              {event.notes && <p style={styles.eventNotes}>{event.notes}</p>}
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
  title: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textPrimary },
  eventsList: { display: "flex", flexDirection: "column", gap: theme.spacing.lg },
  eventCard: { background: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.md, display: "flex", gap: theme.spacing.lg },
  eventDate: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "80px", padding: theme.spacing.md, background: theme.colors.primary, color: theme.colors.white, borderRadius: theme.borderRadius.md },
  dateDay: { fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold },
  dateMonth: { fontSize: theme.typography.fontSize.sm, textTransform: "uppercase" },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm, color: theme.colors.textPrimary },
  eventType: { fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  eventLocation: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  eventCourt: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  eventNotes: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
};
