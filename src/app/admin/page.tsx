import { API_BASE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let docCount = 0, serviceCount = 0, messageCount = 0, unreadCount = 0;
  let totalDownloads = 0;
  let recentMessages: Array<{ id: string; name: string; email: string; subject: string | null; isRead: boolean; createdAt: string }> = [];

  try {
    const [docsRes, servicesRes, messagesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/documents`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/services/admin`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/contact/messages`, { cache: "no-store" }),
    ]);

    if (docsRes.ok) {
      const docs = await docsRes.json();
      docCount = docs.length;
      totalDownloads = docs.reduce((sum: number, d: any) => sum + (d.downloads || 0), 0);
    }

    if (servicesRes.ok) {
      const services = await servicesRes.json();
      serviceCount = services.length;
    }

    if (messagesRes.ok) {
      const messages = await messagesRes.json();
      messageCount = messages.length;
      unreadCount = messages.filter((m: any) => !m.isRead).length;
      recentMessages = messages.slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to load admin stats:", error);
  }

  return (
    <div className="page-enter">
      <div className="admin-header">
        <h1 className="admin-title">Dashboard</h1>
        <span className="badge badge-green">Live</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Documents</div>
          <div className="stat-card-value text-gradient">{docCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Services</div>
          <div className="stat-card-value text-gradient">{serviceCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Downloads</div>
          <div className="stat-card-value text-gradient">{totalDownloads}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Messages</div>
          <div className="stat-card-value text-gradient">{messageCount}</div>
          {unreadCount > 0 && <div className="stat-card-change">{unreadCount} unread</div>}
        </div>
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 16 }}>Recent Messages</h2>
      {recentMessages.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {recentMessages.map((msg) => (
                <tr key={msg.id}>
                  <td><span className={`badge ${msg.isRead ? "badge-green" : "badge-purple"}`}>{msg.isRead ? "Read" : "New"}</span></td>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.subject || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">✉️</div>
          <div className="empty-state-title">No messages yet</div>
        </div>
      )}
    </div>
  );
}
