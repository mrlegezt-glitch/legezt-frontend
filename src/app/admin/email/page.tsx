"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  type: "Student" | "Faculty" | "Core Team";
  roleOrCourse: string;
}

interface ReceivedEmail {
  uid: number;
  seq: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  text: string;
  html: string;
}

export default function EmailWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"compose" | "inbox">("compose");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  // Compose Form State
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inbox Fetching State
  const [inboxEmails, setInboxEmails] = useState<ReceivedEmail[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<ReceivedEmail | null>(null);
  const [emailViewerMode, setEmailViewerMode] = useState<"html" | "text">("html");

  const { getToken } = useAuth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch registered contacts
  useEffect(() => {
    async function loadContacts() {
      try {
        setIsLoadingContacts(true);
        const [stuRes, facRes, teamRes] = await Promise.all([
          fetch(`${apiBase}/api/students`).then(r => r.json()).catch(() => []),
          fetch(`${apiBase}/api/faculties`).then(r => r.json()).catch(() => []),
          fetch(`${apiBase}/api/team`).then(r => r.json()).catch(() => [])
        ]);

        const formatted: Contact[] = [];
        stuRes.forEach((s: any) => {
          if (s.email) formatted.push({ id: s.id, name: s.name, email: s.email, type: "Student", roleOrCourse: s.course });
        });
        facRes.forEach((f: any) => {
          if (f.email) formatted.push({ id: f.id, name: f.name, email: f.email, type: "Faculty", roleOrCourse: f.designation });
        });
        teamRes.forEach((t: any) => {
          if (t.email) formatted.push({ id: t.id, name: t.name, email: t.email, type: "Core Team", roleOrCourse: t.role });
        });

        setContacts(formatted);
      } catch (error) {
        console.error("Error loading system contacts:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    }
    loadContacts();
  }, [apiBase]);

  // Fetch IMAP Inbox
  const fetchInbox = async () => {
    try {
      setIsLoadingInbox(true);
      setInboxError(null);
      const token = await getToken();
      const response = await fetch("/api/admin/inbox", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setInboxEmails(data);
      } else {
        setInboxError(data.error || "Failed to load emails from server.");
      }
    } catch (err) {
      console.error("Error fetching inbox:", err);
      setInboxError("Failed to synchronize with mailbox. Please verify network connections.");
    } finally {
      setIsLoadingInbox(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inbox") {
      fetchInbox();
    }
  }, [activeTab]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      setStatusMsg({ type: "error", text: "All fields are strictly required." });
      return;
    }

    try {
      setIsSending(true);
      setStatusMsg(null);
      
      const token = await getToken();
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ to, subject, body })
      });

      const result = await response.json();
      if (response.ok) {
        setStatusMsg({ type: "success", text: `Email dispatched successfully to ${to}!` });
        setTo("");
        setSubject("");
        setBody("");
      } else {
        setStatusMsg({ type: "error", text: result.error || "Failed to deliver email. Please check SMTP logs." });
      }
    } catch (error) {
      console.error("Email send error:", error);
      setStatusMsg({ type: "error", text: "A network error occurred while dispatching email." });
    } finally {
      setIsSending(false);
    }
  };

  const selectContact = (email: string) => {
    setTo(email);
    setStatusMsg(null);
  };

  const handleReply = (email: ReceivedEmail) => {
    // Extract actual email address from "Sender Name <email@address.com>"
    let replyToAddress = email.from;
    const match = email.from.match(/<([^>]+)>/);
    if (match && match[1]) {
      replyToAddress = match[1];
    }
    
    setTo(replyToAddress);
    setSubject(email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`);
    setBody(`\n\n--- On ${new Date(email.date).toLocaleString()}, ${email.from} wrote:\n> ${email.text.split("\n").join("\n> ")}`);
    setSelectedEmail(null);
    setActiveTab("compose");
  };

  return (
    <div className="admin-page page-enter">
      <div className="admin-page-header">
        <h1>📨 Legezt Email Workspace</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
          Send and receive administrative emails securely via <strong>info@mrlegezt.me</strong>
        </p>
      </div>

      {/* Tabs Selector Navigation */}
      <div style={{ display: "flex", gap: 16, margin: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16 }}>
        <button 
          onClick={() => setActiveTab("compose")}
          className={`sidebar-3d-button ${activeTab === "compose" ? "active" : ""}`}
          style={{ width: "220px" }}
        >
          <span className="btn-3d-shadow"></span>
          <span className="btn-3d-edge"></span>
          <span className="btn-3d-front" style={{ justifyContent: "center" }}>
            📨 Compose Dispatch
          </span>
        </button>

        <button 
          onClick={() => setActiveTab("inbox")}
          className={`sidebar-3d-button ${activeTab === "inbox" ? "active" : ""}`}
          style={{ width: "220px" }}
        >
          <span className="btn-3d-shadow"></span>
          <span className="btn-3d-edge"></span>
          <span className="btn-3d-front" style={{ justifyContent: "center" }}>
            📥 Incoming Inbox
          </span>
        </button>
      </div>

      {/* TAB Content Rendering */}
      {activeTab === "compose" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 30, alignItems: "start" }}>
          {/* Workspace Mail Editor Card */}
          <div className="admin-card" style={{ padding: "30px 40px", position: "relative" }}>
            <div className="card-shine-effect"></div>
            
            <h2 style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: 700, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
              Compose Dispatch Message
            </h2>

            {statusMsg && (
              <div 
                style={{
                  padding: "14px 20px",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: 24,
                  animation: "pulse-glow 2s infinite alternate",
                  backgroundColor: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(218, 38, 28, 0.12)",
                  border: statusMsg.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(218, 38, 28, 0.3)",
                  color: statusMsg.type === "success" ? "#10b981" : "#DA261C"
                }}
              >
                {statusMsg.type === "success" ? "✅" : "⚠️"} {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="admin-form">
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
                  Recipient Address (To)
                </label>
                <input
                  required
                  type="email"
                  placeholder="recipient@example.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 10,
                    backgroundColor: "rgba(3, 6, 36, 0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
                  Subject Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="Official Notification..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 10,
                    backgroundColor: "rgba(3, 6, 36, 0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 28 }}>
                <label style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
                  Email Content Body
                </label>
                <textarea
                  required
                  rows={10}
                  placeholder="Enter your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    borderRadius: 10,
                    backgroundColor: "rgba(3, 6, 36, 0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                />
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary ${isSending ? "loading" : ""}`} 
                disabled={isSending}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  background: "linear-gradient(135deg, #DA261C 0%, #0C1E8B 100%)",
                  boxShadow: "0 4px 20px rgba(218, 38, 28, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.3s ease"
                }}
              >
                {isSending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: 18, height: 18, border: "2px solid #fff", borderRightColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                    DISPATCHING SECURE MESSAGE...
                  </>
                ) : (
                  "⚡ BROADCAST SECURE EMAIL"
                )}
              </button>
            </form>
          </div>

          {/* System Directory Quick Selector */}
          <div className="admin-card" style={{ padding: 24, alignSelf: "start" }}>
            <h2 style={{ fontSize: "1.1rem", color: "#ffffff", fontWeight: 700, marginBottom: 16 }}>
              👥 System Contacts Directory
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 20 }}>
              Click on any active profile below to populate the recipient field instantly.
            </p>

            <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
              {isLoadingContacts ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Loading directory contacts...</p>
              ) : contacts.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No contacts with email addresses registered.</p>
              ) : (
                contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => contact.email && selectContact(contact.email)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: to === contact.email ? "1px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      transition: "all 0.25s ease"
                    }}
                    className="contact-item-hover"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>{contact.name}</div>
                      <span 
                        style={{ 
                          fontSize: "0.7rem", 
                          padding: "2px 8px", 
                          borderRadius: 20, 
                          fontWeight: 700,
                          backgroundColor: contact.type === "Student" ? "rgba(12, 30, 139, 0.15)" : contact.type === "Faculty" ? "rgba(218, 38, 28, 0.12)" : "rgba(139, 92, 246, 0.12)",
                          border: contact.type === "Student" ? "1px solid rgba(12, 30, 139, 0.25)" : contact.type === "Faculty" ? "1px solid rgba(218, 38, 28, 0.25)" : "1px solid rgba(139, 92, 246, 0.25)",
                          color: contact.type === "Student" ? "#8fa0ff" : contact.type === "Faculty" ? "#DA261C" : "#a78bfa"
                        }}
                      >
                        {contact.type}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{contact.roleOrCourse}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--accent-primary)", fontStyle: "italic", marginTop: 4, wordBreak: "break-all" }}>{contact.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* INBOX TAB CONTENT RENDERING */
        <div className="admin-card" style={{ padding: 30, position: "relative" }}>
          <div className="card-shine-effect"></div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16, marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
              📥 Inbox Messages
            </h2>
            <button 
              onClick={fetchInbox} 
              disabled={isLoadingInbox}
              className="btn btn-secondary btn-sm"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                fontWeight: 700
              }}
            >
              <span className={`sync-icon ${isLoadingInbox ? "sync-spinning" : ""}`} style={{ fontSize: "0.95rem" }}>🔄</span>
              {isLoadingInbox ? "Syncing..." : "Sync Mailbox"}
            </button>
          </div>

          {inboxError && (
            <div style={{ padding: "14px 20px", borderRadius: 8, backgroundColor: "rgba(218, 38, 28, 0.12)", border: "1px solid rgba(218, 38, 28, 0.3)", color: "#DA261C", fontSize: "0.9rem", fontWeight: 600, marginBottom: 20 }}>
              ⚠️ {inboxError}
            </div>
          )}

          {isLoadingInbox && inboxEmails.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <span className="spinner-border text-primary" style={{ width: "3rem", height: "3rem", animation: "spin 0.8s linear infinite" }}></span>
              <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: "0.95rem" }}>Establishing secure handshake with Namecheap IMAP mail server...</p>
            </div>
          ) : inboxEmails.length === 0 ? (
            <div className="empty-state" style={{ padding: "60px 0" }}>
              <div className="empty-state-icon" style={{ fontSize: "3rem", marginBottom: 12 }}>📥</div>
              <div className="empty-state-title" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>No emails in mailbox</div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Direct incoming emails to info@mrlegezt.me will appear here.</p>
            </div>
          ) : (
            /* Email List Render */
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {inboxEmails.map((email) => {
                const mailDate = new Date(email.date);
                return (
                  <div 
                    key={email.uid}
                    onClick={() => setSelectedEmail(email)}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      transition: "all 0.25s ease"
                    }}
                    className="email-item-hover"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>{email.from}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{email.to}</div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {mailDate.toLocaleDateString()} {mailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: "0.9rem", margin: "6px 0" }}>{email.subject}</div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                      {email.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULL EMAIL VIEW MODAL */}
      {selectedEmail && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, padding: 24 }}>
          <div className="modal-content admin-card" style={{ maxWidth: 850, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 32, position: "relative", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            <div className="card-shine-effect"></div>
            
            {/* Modal Header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-primary)" }}>{selectedEmail.subject}</h3>
                  <div style={{ fontSize: "0.85rem", color: "#ffffff", marginTop: 8 }}><strong>From:</strong> {selectedEmail.from}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}><strong>To:</strong> {selectedEmail.to}</div>
                </div>
                <button 
                  onClick={() => setSelectedEmail(null)} 
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 10 }}>
                📅 <strong>Received:</strong> {new Date(selectedEmail.date).toLocaleString()}
              </div>
            </div>

            {/* Viewer Mode Toggles (HTML vs Plain Text) */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button 
                onClick={() => setEmailViewerMode("html")} 
                className={`btn ${emailViewerMode === "html" ? "btn-primary" : "btn-secondary"} btn-sm`}
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
              >
                HTML Layout
              </button>
              <button 
                onClick={() => setEmailViewerMode("text")} 
                className={`btn ${emailViewerMode === "text" ? "btn-primary" : "btn-secondary"} btn-sm`}
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
              >
                Plain Text
              </button>
            </div>

            {/* Modal Body (Scrollable Content) */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 250, padding: 20, borderRadius: 8, backgroundColor: "rgba(3, 6, 36, 0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
              {emailViewerMode === "html" && selectedEmail.html ? (
                /* Safely render HTML in sandbox iframe to prevent styling collisions */
                <iframe 
                  srcDoc={`
                    <html>
                    <head>
                      <style>
                        body { 
                          font-family: system-ui, -apple-system, sans-serif; 
                          color: #ffffff !important; 
                          background-color: transparent !important; 
                          line-height: 1.6;
                        }
                        a { color: #8fa0ff; }
                      </style>
                    </head>
                    <body>${selectedEmail.html}</body>
                    </html>
                  `}
                  title="email-body"
                  style={{ width: "100%", height: "100%", border: "none", backgroundColor: "transparent" }}
                  sandbox="allow-popups"
                />
              ) : (
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", color: "#cdd4f8", margin: 0 }}>
                  {selectedEmail.text || "(Empty Message)"}
                </pre>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
              <button onClick={() => setSelectedEmail(null)} className="btn btn-secondary" style={{ padding: "10px 20px" }}>
                Close Viewer
              </button>
              <button 
                onClick={() => handleReply(selectedEmail)} 
                className="btn btn-primary" 
                style={{ 
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #DA261C 0%, #0C1E8B 100%)",
                  boxShadow: "0 4px 15px rgba(218, 38, 28, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                ↩️ REPLY SENDER
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .contact-item-hover:hover {
          background-color: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.12) !important;
          transform: translateX(2px);
        }
        .email-item-hover:hover {
          background-color: rgba(255,255,255,0.04) !important;
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
        }
        .sync-icon {
          display: inline-block;
          transition: transform 0.3s ease;
        }
        .sync-spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
