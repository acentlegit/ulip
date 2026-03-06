import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, getApiUrl } from "../config/api";

export default function Calendar() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    caseId: "",
    title: "",
    type: "HEARING",
    date: "",
    time: "",
    location: "",
    court: "",
    judge: "",
    notes: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Use axios defaults (set by AuthContext) - same as Cases.jsx

      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Set time to end of day for endDate
      endDate.setHours(23, 59, 59, 999);

      console.log("Fetching calendar events...");
      const res = await axios.get(getApiUrl("calendar"), {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      });
      
      console.log("Calendar events received:", res.data);
      setEvents(res.data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      console.error("Error details:", error.response?.data);
      setEvents([]);
      // Don't show alert for 401 (unauthorized) as user might not be logged in
      if (error.response?.status !== 401) {
        alert("Failed to load calendar events. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  const fetchCases = useCallback(async () => {
    try {
      console.log("Fetching cases for calendar...");
      // Use the same approach as Cases.jsx - rely on axios defaults from AuthContext
      const res = await axios.get(getApiUrl("cases"));
      console.log("Cases API response status:", res.status);
      console.log("Cases received:", res.data);
      
      const casesData = Array.isArray(res.data) ? res.data : [];
      console.log(`Loaded ${casesData.length} cases`);
      
      if (casesData.length > 0) {
        console.log("First case:", casesData[0]);
        console.log("Case structure:", {
          id: casesData[0].id,
          title: casesData[0].title,
          caseNumber: casesData[0].caseNumber,
        });
      } else {
        console.warn("No cases returned from API");
      }
      
      setCases(casesData);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error response:", error.response?.data);
      console.error("Error message:", error.message);
      setCases([]);
      
      // Show user-friendly error
      if (error.response?.status === 401) {
        console.warn("Unauthorized - token may be invalid");
      } else if (error.response?.status === 500) {
        console.error("Server error when fetching cases");
      }
    }
  }, []);

  useEffect(() => {
    // Fetch events when component mounts or when date changes
    // Calendar is in ProtectedRoute, so user is authenticated
    // Use axios defaults (set by AuthContext) like Cases.jsx does
    fetchEvents();
    fetchCases();
  }, [currentDate, fetchEvents, fetchCases]);

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().slice(0, 5);
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: dateStr,
      time: timeStr,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use axios defaults (set by AuthContext)
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      await axios.post(
        getApiUrl("calendar/hearings"),
        {
          ...formData,
          date: dateTime.toISOString(),
        }
      );

      setShowModal(false);
      setFormData({
        caseId: "",
        title: "",
        type: "HEARING",
        date: "",
        time: "",
        location: "",
        court: "",
        judge: "",
        notes: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Use axios defaults (set by AuthContext)
      await axios.delete(getApiUrl(`calendar/hearings/${eventId}`));
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event: " + (error.response?.data?.error || error.message));
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Calendar</h1>
        <button
          onClick={() => handleDateClick(new Date())}
          style={styles.addButton}
        >
          ➕ Add Event
        </button>
      </div>

      <div style={styles.calendarNav}>
        <button onClick={() => navigateMonth(-1)} style={styles.navButton}>
          ← Previous
        </button>
        <h2 style={styles.monthTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => navigateMonth(1)} style={styles.navButton}>
          Next →
        </button>
      </div>

      <div style={styles.calendar}>
        <div style={styles.weekHeader}>
          {dayNames.map(day => (
            <div key={day} style={styles.dayHeader}>{day}</div>
          ))}
        </div>
        <div style={styles.daysGrid}>
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} style={styles.dayCell}></div>;
            }

            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                style={{
                  ...styles.dayCell,
                  ...(isToday && styles.todayCell),
                }}
                onClick={() => handleDateClick(date)}
              >
                <div style={styles.dayNumber}>{date.getDate()}</div>
                <div style={styles.eventsContainer}>
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      style={{
                        ...styles.eventDot,
                        backgroundColor: event.type === "HEARING" ? "#ef4444" :
                                        event.type === "TASK" ? "#3b82f6" :
                                        "#10b981"
                      }}
                      title={event.title}
                    >
                      {event.type === "HEARING" ? "⚖️" : event.type === "TASK" ? "✓" : "💰"}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={styles.moreEvents}>+{dayEvents.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.eventsList}>
        <h2 style={styles.eventsTitle}>Upcoming Events</h2>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No events scheduled for this month</p>
            <button
              onClick={() => handleDateClick(new Date())}
              style={styles.addEventButton}
            >
              ➕ Add Your First Event
            </button>
          </div>
        ) : (
          events.slice(0, 10).map((event) => (
            <div key={event.id} style={styles.eventCard}>
              <div style={styles.eventIcon}>
                {event.type === "HEARING" ? "⚖️" : event.type === "TASK" ? "✓" : "💰"}
              </div>
              <div style={styles.eventInfo}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <p style={styles.eventDate}>
                  📅 {new Date(event.date).toLocaleDateString()} at{" "}
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {event.location && (
                  <p style={styles.eventDetail}>📍 {event.location}</p>
                )}
                {event.court && (
                  <p style={styles.eventDetail}>🏛️ {event.court}</p>
                )}
                {event.case && (
                  <p style={styles.eventDetail}>
                    📁 Case: {event.case.title || event.case.caseNumber}
                  </p>
                )}
                {event.type === "HEARING" && (
                  <button
                    onClick={() => handleDelete(event.id)}
                    style={styles.deleteButton}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Event</h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Case (optional)</label>
                <select
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  style={styles.select}
                  disabled={cases.length === 0}
                >
                  <option value="">
                    {cases.length === 0 ? "No cases available - Create a case first" : "Select a case..."}
                  </option>
                  {cases.map((case_) => (
                    <option key={case_.id} value={case_.id}>
                      {case_.title} {case_.caseNumber ? `- ${case_.caseNumber}` : ""}
                    </option>
                  ))}
                </select>
                {cases.length === 0 && (
                  <p style={styles.hintText}>
                    <Link to="/cases" style={styles.linkText}>➕ Create a case</Link> to link events to cases
                  </p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g., Motion Hearing"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Event Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={styles.select}
                >
                  <option value="HEARING">Hearing</option>
                  <option value="DEPOSITION">Deposition</option>
                  <option value="TRIAL">Trial</option>
                  <option value="SETTLEMENT">Settlement Conference</option>
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Courtroom 3A"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Court</label>
                <input
                  type="text"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Superior Court"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Judge</label>
                <input
                  type="text"
                  value={formData.judge}
                  onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Hon. Judge Smith"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={styles.textarea}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  ➕ Add Event
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
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: 0,
  },
  addButton: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  calendarNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "15px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  navButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#f3f4f6",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  monthTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  calendar: {
    background: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
    marginBottom: "8px",
  },
  dayHeader: {
    padding: "10px",
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
    fontSize: "14px",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  dayCell: {
    minHeight: "100px",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    padding: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#fafafa",
  },
  todayCell: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: "2px",
  },
  dayNumber: {
    fontWeight: "600",
    marginBottom: "4px",
    color: "#333",
  },
  eventsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2px",
    marginTop: "4px",
  },
  eventDot: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    cursor: "pointer",
  },
  moreEvents: {
    fontSize: "10px",
    color: "#666",
    fontWeight: "600",
  },
  eventsList: {
    background: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  eventsTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    color: "#333",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  addEventButton: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  eventCard: {
    display: "flex",
    gap: "16px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    transition: "all 0.2s",
  },
  eventIcon: {
    fontSize: "32px",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    margin: "0 0 8px 0",
    color: "#333",
    fontSize: "18px",
    fontWeight: "600",
  },
  eventDate: {
    margin: "4px 0",
    color: "#666",
    fontSize: "14px",
  },
  eventDetail: {
    margin: "4px 0",
    color: "#666",
    fontSize: "14px",
  },
  deleteButton: {
    marginTop: "8px",
    padding: "6px 12px",
    fontSize: "12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
  errorState: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#ef4444",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: "#1a1a2e",
  },
  modalCloseButton: {
    background: "none",
    border: "none",
    fontSize: "32px",
    color: "#666",
    cursor: "pointer",
    padding: 0,
    width: "32px",
    height: "32px",
    lineHeight: "32px",
  },
  form: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "30px",
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#f3f4f6",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  hintText: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
    fontStyle: "italic",
  },
  linkText: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500",
  },
};
