import { useEffect, useState } from "react";
import axios from "axios";

import { getApiUrl } from "../config/api";
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(getApiUrl("tasks"));
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>Tasks</h1>
        <button style={styles.newButton}>+ New Task</button>
      </div>
      <div style={styles.tasksList}>
        {tasks.map((task) => (
          <div key={task.id} style={styles.taskCard}>
            <div style={styles.taskHeader}>
              <h3 style={styles.taskHeaderH3}>{task.title}</h3>
              <span style={{...styles.status, ...getStatusColor(task.status)}}>
                {task.status}
              </span>
            </div>
            {task.description && <p>{task.description}</p>}
            <div style={styles.taskMeta}>
              {task.assignee && <span>Assigned to: {task.assignee.name}</span>}
              {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
              {task.case && <span>Case: {task.case.title}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    TODO: { background: "#e3f2fd", color: "#1976d2" },
    IN_PROGRESS: { background: "#fff3e0", color: "#f57c00" },
    COMPLETED: { background: "#e8f5e9", color: "#388e3c" }
  };
  return colors[status] || { background: "#f5f5f5", color: "#666" };
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  headerH1: { fontSize: "32px", color: "#333" },
  newButton: { padding: "12px 24px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  tasksList: { display: "flex", flexDirection: "column", gap: "12px" },
  taskCard: { background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" },
  taskHeaderH3: { margin: 0, color: "#333" },
  status: { padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" },
  taskMeta: { display: "flex", gap: "16px", fontSize: "14px", color: "#666", marginTop: "12px" }
};
