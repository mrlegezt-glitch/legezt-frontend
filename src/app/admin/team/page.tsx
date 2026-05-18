"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function TeamAdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", email: "", githubUrl: "", linkedinUrl: "", imageUrl: "" });
  const { getToken } = useAuth();

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/team`);
      const data = await res.json();
      setTeamMembers(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/team`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: "", role: "", email: "", githubUrl: "", linkedinUrl: "", imageUrl: "" });
      fetchTeamMembers();
    } catch (error) {
      console.error("Error creating team member:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/team`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      });
      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>👥 Team Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Team Member</button>
      </div>

      <div className="admin-card">
        {isLoading ? (
          <p>Loading team members...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Social Links</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center" }}>No team members found.</td></tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.role}</td>
                    <td>{member.email || "N/A"}</td>
                    <td>
                      {member.githubUrl && <a href={member.githubUrl} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>GitHub</a>}
                      {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(member.id)}>Delete</button>
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
            <h2>Add Team Member</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input required type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>GitHub URL (Optional)</label>
                <input type="url" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label>LinkedIn URL (Optional)</label>
                <input type="url" value={formData.linkedinUrl} onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
