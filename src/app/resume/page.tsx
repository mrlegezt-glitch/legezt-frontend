import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume — Legezt",
  description: "View and download the professional resume.",
};

export default function ResumePage() {
  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Professional Profile</div>
            <h1 className="section-title">My <span className="text-gradient">Resume</span></h1>
            <p className="section-desc">View my professional experience, skills, and qualifications.</p>
          </div>

          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: "4rem", marginBottom: 24 }}>📄</div>
              <h2 style={{ marginBottom: 12 }}>Resume</h2>
              <p className="card-desc" style={{ marginBottom: 32 }}>
                Upload your resume via the Admin Dashboard to display it here.
                Visitors will be able to view and download it.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>
                  📥 Download Resume
                </button>
                <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>
                  🖨️ Print Version
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
