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
            <div className="hero-actions">
              <Link href="/documents" className="btn btn-primary">
                ⚡ ACCESS DATA VAULT
              </Link>
              <Link href="/services" className="btn btn-secondary">
                ⚙️ EXPLORE OPERATIONS
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
                    <div className="card-icon">{service.icon || "🚀"}</div>
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
                { icon: "💼", title: "Consulting", desc: "Professional consulting services for your business needs." },
                { icon: "📄", title: "Document Services", desc: "Quality document preparation, formatting, and distribution." },
                { icon: "🌐", title: "Digital Solutions", desc: "Modern digital solutions to grow your online presence." },
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
            <Link href="/services" className="btn btn-secondary">View All Services →</Link>
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
                  <div className="doc-preview">📄{doc.category && <span className="doc-badge">{doc.category}</span>}</div>
                  <div className="doc-info">
                    <div className="doc-title">{doc.title}</div>
                    <p className="card-desc" style={{ marginBottom: 8 }}>{doc.description}</p>
                    <div className="doc-meta">
                      <span>📥 {doc.downloads} downloads</span>
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
              <div className="empty-state-icon">📁</div>
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
            <Link href="/contact" className="btn btn-primary">📞 Contact Us</Link>
            <Link href="/resume" className="btn btn-secondary">📄 View Resume</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <img src="/logo.png" alt="Legezt Logo" className="nav-logo-img" />
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
            <span>Built with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
