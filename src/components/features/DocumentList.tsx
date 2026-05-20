"use client";

import { useState } from "react";
import { formatFileSize, formatDate, API_BASE_URL } from "@/lib/utils";

interface Doc {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  category: string | null;
  downloads: number;
  createdAt: string;
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

export function DocumentList({ documents }: { documents: Doc[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(documents.map((d) => d.category).filter(Boolean)))];
  const filtered = documents.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || d.category === category;
    return matchSearch && matchCat;
  });

  async function handleDownload(doc: Doc) {
    try {
      await fetch(`/api/documents/${doc.id}/download`, { method: "POST" });
    } catch { /* ignore */ }
    window.open(getCorrectFileUrl(doc.fileUrl), "_blank");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <input
          className="form-input"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat || "all"}
              className={`btn btn-sm ${category === cat ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCategory(cat || "all")}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map((doc) => (
            <div className="doc-card" key={doc.id}>
              <div className="doc-preview">
                📄
                {doc.category && <span className="doc-badge">{doc.category}</span>}
              </div>
              <div className="doc-info">
                <div className="doc-title">{doc.title}</div>
                {doc.description && <p className="card-desc">{doc.description}</p>}
                <div className="doc-meta" style={{ marginTop: 8 }}>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>📥 {doc.downloads}</span>
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
                <div className="doc-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleDownload(doc)}>
                    ⬇️ Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">No documents found</div>
          <p>{search ? "Try a different search term." : "Documents will appear here once uploaded."}</p>
        </div>
      )}
    </div>
  );
}
