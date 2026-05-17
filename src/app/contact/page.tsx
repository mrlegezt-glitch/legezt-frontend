"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Get In Touch</div>
            <h1 className="section-title">Contact <span className="text-gradient">Us</span></h1>
            <p className="section-desc">Have a question or need a service? Send us a message.</p>
          </div>

          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <form onSubmit={handleSubmit} className="card" style={{ padding: 40 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Name</label>
                <input id="contact-name" className="form-input" placeholder="Your name" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email</label>
                <input id="contact-email" className="form-input" type="email" placeholder="your@email.com" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" className="form-input" placeholder="What is this about?"
                  value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" className="form-input" placeholder="Your message..." required
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}
                disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send Message ✉️"}
              </button>

              {status === "sent" && (
                <div className="toast toast-success" style={{ position: "relative", marginTop: 16, bottom: "auto", right: "auto" }}>
                  ✅ Message sent successfully! We&apos;ll get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="toast toast-error" style={{ position: "relative", marginTop: 16, bottom: "auto", right: "auto" }}>
                  ❌ Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
