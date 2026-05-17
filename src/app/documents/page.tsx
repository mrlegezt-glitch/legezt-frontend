import type { Metadata } from "next";
import { DocumentList } from "@/components/features/DocumentList";

import { API_BASE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documents — Legezt",
  description: "Browse and download professional documents, templates, and resources.",
};

export default async function DocumentsPage() {
  let documents: Array<{
    id: string; title: string; description: string | null;
    fileName: string; fileUrl: string; fileSize: number;
    category: string | null; downloads: number; createdAt: string;
  }> = [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`, { cache: "no-store" });
    if (res.ok) {
      documents = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch documents:", error);
  }

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Resources</div>
            <h1 className="section-title">Document <span className="text-gradient">Library</span></h1>
            <p className="section-desc">Download professional documents, guides, and resources.</p>
          </div>
          <DocumentList documents={documents} />
        </div>
      </section>
    </div>
  );
}
