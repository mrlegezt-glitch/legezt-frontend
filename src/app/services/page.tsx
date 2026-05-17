import type { Metadata } from "next";

import { API_BASE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services — Legezt",
  description: "Explore our professional services. Quality solutions tailored to your needs.",
};

export default async function ServicesPage() {
  let services: Array<{
    id: string; title: string; description: string;
    icon: string | null; price: string | null; features: string; isActive: boolean;
  }> = [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/services`, { cache: "no-store" });
    if (res.ok) {
      services = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Our Expertise</div>
            <h1 className="section-title">Professional <span className="text-gradient">Services</span></h1>
            <p className="section-desc">We offer a comprehensive range of services to meet your professional needs.</p>
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
                    {service.price && (
                      <div style={{ marginTop: 12, fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                        {service.price}
                      </div>
                    )}
                    {features.length > 0 && (
                      <ul className="card-features">
                        {features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🛠️</div>
              <div className="empty-state-title">Services coming soon</div>
              <p>We&apos;re preparing our service offerings. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
