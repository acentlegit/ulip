export default function Reports() {
  return (
    <div style={styles.container}>
      <h1>Reports & Analytics</h1>
      <div style={styles.reportsGrid}>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardH3}>Revenue Report</h3>
          <p style={styles.reportCardP}>View revenue by period, client, or case</p>
        </div>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardH3}>Case Performance</h3>
          <p style={styles.reportCardP}>Analyze case outcomes and efficiency</p>
        </div>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardH3}>Lawyer Productivity</h3>
          <p style={styles.reportCardP}>Track billable hours and productivity</p>
        </div>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardH3}>Client Acquisition</h3>
          <p style={styles.reportCardP}>Monitor new client growth</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  reportsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: "20px" 
  },
  reportCard: { 
    background: "white", 
    padding: "24px", 
    borderRadius: "12px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
  },
  reportCardH3: { 
    marginBottom: "8px", 
    color: "#333" 
  },
  reportCardP: { 
    color: "#666", 
    fontSize: "14px" 
  }
};
