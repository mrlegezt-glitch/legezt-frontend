"use client";

import { useState, useEffect, useRef } from "react";
import { formatFileSize, formatDate, API_BASE_URL } from "@/lib/utils";
import { FileText, Share2 } from "lucide-react";
import EditorStudio from "@/components/EditorStudio";

interface Doc {
  id: string; title: string; description: string | null; fileName: string;
  fileUrl: string; fileSize: number; category: string | null;
  downloads: number; isPublic: boolean; createdAt: string;
  year?: number | null; branch?: string | null; batch?: string | null;
}

const getCorrectFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("http://")) {
    if (url.includes("/uploads/")) {
      const filePart = url.substring(url.indexOf("/uploads/"));
      return `${API_BASE_URL}${filePart}`;
    }
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default function AdminDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [activeShareDoc, setActiveShareDoc] = useState<Doc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    const res = await fetch("/api/documents");
    if (res.ok) setDocs(await res.json());
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !title) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("description", description);
    fd.append("category", category);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    if (res.ok) {
      setShowUpload(false);
      setTitle(""); setDescription(""); setCategory("");
      fetchDocs();
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchDocs();
  }

  return (
    <div className="page-enter">
      <div className="admin-header">
        <h1 className="admin-title">Documents</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-primary" onClick={() => setShowEditor(true)} style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none" }}>
            🎨 PDF Editor Studio
          </button>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>+ Upload Document</button>
        </div>
      </div>

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Upload Document</h3>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Resume, Template" />
            </div>
            <div className="form-group">
              <label className="form-label">File (PDF) *</label>
              <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                <div className="upload-icon" style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <FileText size={32} style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="upload-text">Click to <strong>select a file</strong></div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.xlsx" style={{ display: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ flex: 1 }}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {docs.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Target Audience</th><th>Size</th><th>Downloads</th><th>Uploaded At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 600 }}>{doc.title}</td>
                  <td><span className="badge badge-purple">{doc.category || "General"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>Yr: {doc.year ?? "All"}</span>
                      <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>Br: {doc.branch ?? "All"}</span>
                      {doc.batch && <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>Bt: {doc.batch}</span>}
                    </div>
                  </td>
                  <td>{formatFileSize(doc.fileSize)}</td>
                  <td>{doc.downloads}</td>
                  <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {new Date(doc.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={getCorrectFileUrl(doc.fileUrl)} target="_blank" rel="noopener" className="btn btn-secondary btn-sm">View</a>
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveShareDoc(doc)}>Share</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          </div>
          <div className="empty-state-title">No documents yet</div>
          <p>Upload your first document to get started.</p>
        </div>
      )}
      {showEditor && (
        <EditorStudio 
          onClose={() => setShowEditor(false)} 
          onUploadSuccess={fetchDocs} 
          uploaderRole="admin" 
        />
      )}
      {activeShareDoc && (
        <ShareModal 
          doc={activeShareDoc} 
          onClose={() => setActiveShareDoc(null)} 
        />
      )}
    </div>
  );
}

interface ShareModalProps {
  doc: Doc;
  onClose: () => void;
}

function ShareModal({ doc, onClose }: ShareModalProps) {
  const absoluteDownloadUrl = getCorrectFileUrl(doc.fileUrl);
  const shareMessage = `*Mr. Legezt Portal* 📂\n\nHey! Check out this document: *${doc.title}*\nDownload link: ${absoluteDownloadUrl}\n\nJoin our LIET student portal to access syllabus, notes, assignments and more: https://portal.mrlegezt.me`;
  
  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: `Check out this document on LIET Portal: ${doc.title}`,
          url: absoluteDownloadUrl
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(absoluteDownloadUrl);
      alert("Download link copied to clipboard!");
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: "#121214",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "24px",
          width: "360px",
          maxWidth: "90%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>Share Document</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
        </div>
        
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#718096" }}>
          Share <strong>{doc.title}</strong> with credits and invite link.
        </p>

        <button 
          onClick={handleWhatsAppShare} 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: "#25d366",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          💬 Share on WhatsApp
        </button>

        <button 
          onClick={handleNativeShare} 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          📱 Device Share / Copy Link
        </button>
      </div>
    </div>
  );
}
