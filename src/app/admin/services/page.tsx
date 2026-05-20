"use client";

import { useState, useEffect } from "react";
import { Sliders } from "lucide-react";

interface ServiceItem {
  id: string; title: string; description: string; icon: string | null;
  price: string | null; features: string; isActive: boolean; sortOrder: number;
}

export default function AdminServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "", price: "", features: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    const res = await fetch("/api/services");
    if (res.ok) setServices(await res.json());
  }

  function openEdit(s: ServiceItem) {
    setEditing(s);
    const features = JSON.parse(s.features || "[]") as string[];
    setForm({ title: s.title, description: s.description, icon: s.icon || "", price: s.price || "", features: features.join("\n") });
    setShowForm(true);
  }

  function openNew() {
    setEditing(null);
    setForm({ title: "", description: "", icon: "", price: "", features: "" });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.description) return;
    setSaving(true);
    const features = form.features.split("\n").filter(Boolean);
    const body = { ...form, features, ...(editing ? { id: editing.id } : {}) };
    const res = await fetch("/api/services", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      fetchServices();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    fetchServices();
  }

  async function toggleActive(s: ServiceItem) {
    await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, isActive: !s.isActive }),
    });
    fetchServices();
  }

  return (
    <div className="page-enter">
      <div className="admin-header">
        <h1 className="admin-title">Services</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Service</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editing ? "Edit Service" : "Add Service"}</h3>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Icon (name)</label>
                <input className="form-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Sliders" />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹999" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Features (one per line)</label>
              <textarea className="form-input" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder={"Feature 1\nFeature 2\nFeature 3"} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {services.length > 0 ? (
        <div className="grid-3">
          {services.map((s) => {
            const features = JSON.parse(s.features || "[]") as string[];
            return (
              <div className="card" key={s.id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div className="card-icon" style={{ display: "flex", alignItems: "center" }}>
                    <Sliders size={20} style={{ color: "var(--text-primary)" }} />
                  </div>
                  <span className={`badge ${s.isActive ? "badge-green" : "badge-red"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="card-title">{s.title}</h3>
                <p className="card-desc">{s.description}</p>
                {s.price && <div style={{ marginTop: 8, fontWeight: 700, color: "var(--accent-primary)" }}>{s.price}</div>}
                {features.length > 0 && (
                  <ul className="card-features">
                    {features.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(s)}>
                    {s.isActive ? "Disable" : "Enable"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sliders size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          </div>
          <div className="empty-state-title">No services yet</div>
          <p>Add your first service to showcase on the website.</p>
        </div>
      )}
    </div>
  );
}
