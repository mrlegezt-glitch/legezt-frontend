import Link from "next/link";
import { API_BASE_URL } from "@/lib/utils";

export default async function HomePage() {
  let services: Array<{ id: string; title: string; description: string; icon: string | null; features: string }> = [];
  let documents: Array<{ id: string; title: string; description: string | null; category: string | null; downloads: number; fileName: string }> = [];

  try {
    const [sRes, dRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/services`, { signal: AbortSignal.timeout(5000), next: { revalidate: 30 } }),
      fetch(`${API_BASE_URL}/api/documents`, { signal: AbortSignal.timeout(5000), next: { revalidate: 30 } }),
    ]);

    if (sRes.ok) {
      const allServices = await sRes.json();
      services = allServices.slice(0, 6);
    }

    if (dRes.ok) {
      const allDocs = await dRes.json();
      documents = allDocs.filter((d: any) => d.isPublic).slice(0, 4);
    }
  } catch (error) {
    console.error("Failed to fetch landing page data:", error);
  }

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-grid-bg"></div>
        <div className="hero-radial-glow"></div>
        {/* Cinematic Background Slideshow synced with text transitions */}
        <div className="hero-slideshow-container">
          <div className="hero-slide slide-1" style={{ backgroundImage: 'url("/bg-1.png")' }}></div>
          <div className="hero-slide slide-2" style={{ backgroundImage: 'url("/bg-2.png")' }}></div>
          <div className="hero-slide slide-3" style={{ backgroundImage: 'url("/bg-3.png")' }}></div>
          <div className="hero-slide slide-4" style={{ backgroundImage: 'url("/bg-4.png")' }}></div>
          <div className="hero-slideshow-overlay"></div>
        </div>
        <div className="hero-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * -10}s`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
              }}
            />
          ))}
        </div>
        <div className="hero-two-column">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="dot"></span>
              SYSTEMS ENGAGED & AVAILABLE
            </div>
            <div className="hero-title-container">
              <h1 className="hero-scroll-title">
                <div className="scroll-wrapper">
                  <div className="scroll-item">MR LEGEZT</div>
                  <div className="scroll-item">THE LEGEZT</div>
                  <div className="scroll-item">W LEGEZT</div>
                  <div className="scroll-item">I AM LEGEZT</div>
                  <div className="scroll-item">MR LEGEZT</div>
                </div>
              </h1>
            </div>
            <p className="hero-subtitle">
              Professional AI services, automation systems, premium digital resources, intelligent tools, and cyber solutions. Engineered for elite digital operations.
            </p>
            <div className="hero-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a 
                href={process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://portal.mrlegezt.me"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                GET STARTED WORKSPACE
              </a>
              <Link href="/documents" className="btn btn-secondary">
                ACCESS DATA VAULT
              </Link>
              <Link href="/services" className="btn btn-secondary">
                EXPLORE OPERATIONS
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">{documents.length}+</div>
                <div className="stat-label">VAULT FILES</div>
              </div>
              <div className="stat">
                <div className="stat-value">{services.length}+</div>
                <div className="stat-label">OPERATIONS</div>
              </div>
              <div className="stat">
                <div className="stat-value">24/7</div>
                <div className="stat-label">uptime</div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="logo-container">
              <div className="logo-aura-glow"></div>
              <div className="logo-smoke-layer"></div>
              <div className="logo-lightning-layer"></div>
              <video
                src="/hero-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="hero-cyber-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="services-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">Professional <span className="text-gradient">Services</span></h2>
            <p className="section-desc">Explore our range of professional services tailored to meet your needs.</p>
          </div>
          {services.length > 0 ? (
            <div className="grid-3">
              {services.map((service) => {
                const features = JSON.parse(service.features || "[]") as string[];
                return (
                  <div className="card" key={service.id}>
                    <div className="card-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="22" y1="12" x2="18" y2="12" />
                        <line x1="6" y1="12" x2="2" y2="12" />
                        <line x1="12" y1="6" x2="12" y2="2" />
                        <line x1="12" y1="22" x2="12" y2="18" />
                      </svg>
                    </div>
                    <h3 className="card-title">{service.title}</h3>
                    <p className="card-desc">{service.description}</p>
                    {features.length > 0 && (
                      <ul className="card-features">
                        {features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid-3">
              {[
                { 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  ), 
                  title: "Consulting", 
                  desc: "Professional consulting services for your business needs." 
                },
                { 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  ), 
                  title: "Document Services", 
                  desc: "Quality document preparation, formatting, and distribution." 
                },
                { 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  ), 
                  title: "Digital Solutions", 
                  desc: "Modern digital solutions to grow your online presence." 
                },
              ].map((s, i) => (
                <div className="card" key={i}>
                  <div className="card-icon">{s.icon}</div>
                  <h3 className="card-title">{s.title}</h3>
                  <p className="card-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="/services" className="btn btn-secondary">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Academic Portal Section */}
      <section className="section" id="portal-section" style={{ background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Academic Network</div>
            <h2 className="section-title">Student & Faculty <span className="text-gradient">Portals</span></h2>
            <p className="section-desc">Access secure academic management portals for unified college operations, resource sharing, and student grading.</p>
          </div>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: 40 }}>
            <div className="card" style={{ background: "rgba(10, 10, 10, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)", padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="card-icon" style={{ marginBottom: 20 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>
                <h3 className="card-title" style={{ fontSize: "1.5rem", marginBottom: 12 }}>Student Hub</h3>
                <p className="card-desc" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Access assignments, view academic schedules, download shared lecture documents, and communicate directly with your instructors.
                </p>
              </div>
              <div style={{ marginTop: 32 }}>
                <a 
                  href={process.env.NODE_ENV === "development" ? "http://localhost:3001/student/login" : "https://portal.mrlegezt.me/student/login"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
                >
                  Enter Student Portal
                </a>
              </div>
            </div>
            <div className="card" style={{ background: "rgba(10, 10, 10, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)", padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="card-icon" style={{ marginBottom: 20 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10M6 10h10M6 14h10" />
                  </svg>
                </div>
                <h3 className="card-title" style={{ fontSize: "1.5rem", marginBottom: 12 }}>Faculty Hub</h3>
                <p className="card-desc" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Orchestrate your classes, manage assignment postings, upload course files, record attendance logs, and mentor students efficiently.
                </p>
              </div>
              <div style={{ marginTop: 32 }}>
                <a 
                  href={process.env.NODE_ENV === "development" ? "http://localhost:3001/faculty/login" : "https://portal.mrlegezt.me/faculty/login"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
                >
                  Enter Faculty Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="section" id="documents-section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Resources</div>
            <h2 className="section-title">Latest <span className="text-gradient">Documents</span></h2>
            <p className="section-desc">Download professional documents, templates, and resources.</p>
          </div>
          {documents.length > 0 ? (
            <div className="grid-3">
              {documents.map((doc) => (
                <div className="doc-card" key={doc.id}>
                  <div className="doc-preview">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginRight: "8px" }}>
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {doc.category && <span className="doc-badge">{doc.category}</span>}
                  </div>
                  <div className="doc-info">
                    <div className="doc-title">{doc.title}</div>
                    <p className="card-desc" style={{ marginBottom: 8 }}>{doc.description}</p>
                    <div className="doc-meta">
                      <span>{doc.downloads} downloads</span>
                    </div>
                    <div className="doc-actions">
                      <Link href={`/documents`} className="btn btn-primary btn-sm">Download</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="empty-state-title">Documents coming soon</div>
              <p>Check back later for professional documents and resources.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" id="cta-section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="section-title">Ready to Get <span className="text-gradient">Started</span>?</h2>
          <p className="section-desc" style={{ marginBottom: 40 }}>
            Have a question or need a custom service? Get in touch with us today.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary">Contact Us</Link>
            <Link href="/resume" className="btn btn-secondary">View Resume</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <img src="/logo.svg" alt="Legezt Logo" className="nav-logo-img" />
                <span className="nav-logo-text">LEGEZT</span>
              </div>
              <p>Professional document distribution platform. Quality resources, expert services, and seamless access.</p>
            </div>
            <div>
              <div className="footer-title">Quick Links</div>
              <ul className="footer-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/documents">Documents</Link></li>
                <li><Link href="/resume">Resume</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Resources</div>
              <ul className="footer-links">
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/documents">Downloads</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Connect</div>
              <ul className="footer-links">
                <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a></li>
                <li><a href="mailto:contact@legezt.app">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Legezt. All rights reserved.</span>
            <span>Built with precision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
