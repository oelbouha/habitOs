export default function Privacy() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Privacy Policy for Habivio</h1>
      <p style={styles.updated}>Last updated: 2026</p>

      <h2 style={styles.subheading}>1. Overview</h2>
      <p>Habivio is a private habit and task tracking application designed for personal use.</p>

      <h2 style={styles.subheading}>2. Data Collection</h2>
      <p>Habivio does not collect, store, or share personal data on external servers.</p>
      <p>All data (habits, tasks, meals, finances) is stored locally on your device.</p>

      <h2 style={styles.subheading}>3. Data Sharing</h2>
      <p>We do not sell, trade, or share user data with third parties.</p>

      <h2 style={styles.subheading}>4. Internet Access</h2>
      <p>If internet access is used (for updates or future features), no personal tracking data is transmitted.</p>

      <h2 style={styles.subheading}>5. Security</h2>
      <p>Your data remains on your device and under your control.</p>

      <h2 style={styles.subheading}>6. Contact</h2>
      <p>Email: outmanelbouhali5@gmail.com</p>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    lineHeight: 1.6,
    padding: '0 20px',
    color: '#222',
  },
  heading: {
    color: '#0E1A2B',
  },
  subheading: {
    color: '#0E1A2B',
  },
  updated: {
    color: '#666',
  },
};
