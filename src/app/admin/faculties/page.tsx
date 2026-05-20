"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface Faculty {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function FacultiesAdminPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", department: "", designation: "", email: "", imageUrl: "" });
  const { getToken } = useAuth();

  const fetchFaculties = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faculties`);
      const data = await res.json();
      setFaculties(data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faculties`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: "", department: "", designation: "", email: "", imageUrl: "" });
      fetchFaculties();
    } catch (error) {
      console.error("Error creating faculty:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faculties`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      });
      fetchFaculties();
    } catch (error) {
      console.error("Error deleting faculty:", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Faculty Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Faculty</button>
      </div>

      <div className="admin-card">
        {isLoading ? (
          <p>Loading faculties...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center" }}>No faculties found.</td></tr>
              ) : (
                faculties.map((fac) => (
                  <tr key={fac.id}>
                    <td>{fac.name}</td>
                    <td>{fac.department}</td>
                    <td>{fac.designation}</td>
                    <td>{fac.email || "N/A"}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(fac.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Faculty</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input required type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input required type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
