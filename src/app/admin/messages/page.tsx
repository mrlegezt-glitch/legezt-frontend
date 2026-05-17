import { formatDate } from "@/lib/utils";

export default async function AdminMessages() {
  let messages: Array<{
    id: string; name: string; email: string; subject: string | null;
    message: string; isRead: boolean; createdAt: string;
  }> = [];

  try {
    const res = await fetch("http://localhost:5000/api/contact/messages", { cache: "no-store" });
    if (res.ok) {
      messages = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch admin messages:", error);
  }

  return (
    <div className="page-enter">
      <div className="admin-header">
        <h1 className="admin-title">✉️ Messages</h1>
        <span className="badge badge-purple">{messages.filter(m => !m.isRead).length} unread</span>
      </div>

      {messages.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg) => (
            <div className="card" key={msg.id} style={{ borderLeft: msg.isRead ? undefined : "3px solid var(--accent-primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{msg.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{msg.email}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge ${msg.isRead ? "badge-green" : "badge-purple"}`}>
                    {msg.isRead ? "Read" : "New"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatDate(new Date(msg.createdAt))}</span>
                </div>
              </div>
              {msg.subject && <div style={{ fontWeight: 600, marginBottom: 8 }}>{msg.subject}</div>}
              <p className="card-desc">{msg.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">✉️</div>
          <div className="empty-state-title">No messages yet</div>
          <p>Contact form submissions will appear here.</p>
        </div>
      )}
    </div>
  );
}
