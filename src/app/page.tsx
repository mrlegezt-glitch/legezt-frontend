import Link from "next/link";

export default async function HomePage() {
  let services: Array<{ id: string; title: string; description: string; icon: string | null; features: string }> = [];
  let documents: Array<{ id: string; title: string; description: string | null; category: string | null; downloads: number; fileName: string }> = [];

  try {
    const sRes = await fetch("http://localhost:5000/api/services", { cache: "no-store" });
    if (sRes.ok) {
      const allServices = await sRes.json();
      services = allServices.slice(0, 6);
    }

    const dRes = await fetch("http://localhost:5000/api/documents", { cache: "no-store" });
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
        <div className="hero-bg"></div>
        <div className="hero-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * -8}s`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
              }}
            />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot"></span>
            Available for Projects
          </div>
          <h1 className="hero-title">
            Professional <span className="text-gradient">Document Distribution</span> Platform
          </h1>
          <p className="hero-subtitle">
            Access premium documents, explore professional services, and connect with expertise.
            Your one-stop platform for quality resources.
          </p>
          <div className="hero-actions">
            <Link href="/documents" className="btn btn-primary">
              📄 Browse Documents
            </Link>
            <Link href="/services" className="btn btn-secondary">
              🛠️ View Services
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value text-gradient">{documents.length}+</div>
              <div className="stat-label">Documents</div>
            </div>
            <div className="stat">
              <div className="stat-value text-gradient">{services.length}+</div>
              <div className="stat-label">Services</div>
            </div>
            <div className="stat">
              <div className="stat-value text-gradient">24/7</div>
              <div className="stat-label">Available</div>
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
              <div className="nav-logo"><span className="text-gradient">Legezt</span></div>
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
