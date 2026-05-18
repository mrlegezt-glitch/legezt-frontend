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

export default function EmailWorkspacePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  // Email Form State
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { getToken } = useAuth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch all registered students, faculties, and team members to populate the quick contacts panel
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

  return (
    <div className="admin-page page-enter">
      <div className="admin-page-header">
        <h1>📨 Administrative Email Workspace</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
          Send secure custom emails to any address via <strong>info@mrlegezt.me</strong>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 30, alignItems: "start", marginTop: 24 }}>
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
                placeholder="Enter your administrative message or announcement body here..."
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
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .contact-item-hover:hover {
          background-color: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.12) !important;
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}
