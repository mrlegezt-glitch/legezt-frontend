"use client";

import { useState, useEffect } from "react";
import { Edit, Trash, Check, Search, RefreshCw } from "lucide-react";

interface PortalFaculty {
  id: string;
  fullName: string;
  username: string;
  workEmail: string;
  designation: string;
  department: string;
  collegeName: string;
  status: string;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function PortalFacultiesAdminPage() {
  const [faculties, setFaculties] = useState<PortalFaculty[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<PortalFaculty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<PortalFaculty | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    workEmail: "",
    designation: "",
    department: "",
    phone: "",
    status: "pending"
  });

  const fetchFaculties = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/portal-faculties");
      if (res.ok) {
        const data = await res.json();
        setFaculties(data.faculties || []);
      }
    } catch (error) {
      console.error("Error fetching portal faculties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = faculties.filter(
      (fac) =>
        fac.fullName.toLowerCase().includes(query) ||
        fac.workEmail.toLowerCase().includes(query) ||
        fac.department.toLowerCase().includes(query) ||
        fac.designation.toLowerCase().includes(query)
    );
    setFilteredFaculties(filtered);
  }, [searchQuery, faculties]);

  const handleApprove = async (facultyId: string) => {
    try {
      const res = await fetch("/api/admin/portal-faculties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, status: "approved" }),
      });
      if (res.ok) {
        fetchFaculties();
      }
    } catch (error) {
      console.error("Error approving faculty:", error);
    }
  };

  const handleDelete = async (facultyId: string) => {
    if (!confirm("Are you sure you want to delete this faculty member and all their portal data?")) return;
    try {
      const res = await fetch("/api/admin/portal-faculties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId }),
      });
      if (res.ok) {
        fetchFaculties();
      }
    } catch (error) {
      console.error("Error deleting faculty:", error);
    }
  };

  const openEditModal = (fac: PortalFaculty) => {
    setSelectedFaculty(fac);
    setFormData({
      fullName: fac.fullName,
      username: fac.username,
      workEmail: fac.workEmail,
      designation: fac.designation,
      department: fac.department,
      phone: fac.phone || "",
      status: fac.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    try {
      const res = await fetch("/api/admin/portal-faculties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          ...formData
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchFaculties();
      }
    } catch (error) {
      console.error("Error updating faculty:", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Portal Faculty Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Manage registered portal accounts, verify departments/designations, and update details.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchFaculties} disabled={isLoading} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={14} className={isLoading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div style={{ margin: "20px 0", display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by name, email, designation, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#fff",
              fontSize: "0.9rem"
            }}
          />
        </div>
      </div>

      <div className="admin-card">
        {isLoading ? (
          <p style={{ padding: 20 }}>Loading portal faculties...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Faculty Info</th>
                  <th>Department & Designation</th>
                  <th>Credentials</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculties.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px 20px" }}>
                      No portal faculties found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFaculties.map((fac) => (
                    <tr key={fac.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fac.fullName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Registered: {new Date(fac.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <div>{fac.designation}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{fac.department}</div>
                      </td>
                      <td>
                        <div>{fac.workEmail}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>@{fac.username}</div>
                      </td>
                      <td>
                        <span className={`badge ${fac.status === "approved" ? "badge-green" : fac.status === "pending" ? "badge-purple" : "badge-red"}`} style={{ textTransform: "capitalize" }}>
                          {fac.status}
                        </span>
                      </td>
                      <td>
                        {fac.lastLoginAt ? (
                          <div style={{ fontSize: "0.85rem" }}>{new Date(fac.lastLoginAt).toLocaleString()}</div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Never logged in</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {fac.status === "pending" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(fac.id)}
                              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#10b981", borderColor: "#10b981", color: "#fff" }}
                              title="Approve faculty account"
                            >
                              <Check size={14} /> Approve
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(fac)}
                            style={{ padding: "4px 8px" }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(fac.id)}
                            style={{ padding: "4px 8px" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <h2>Edit Faculty Details</h2>
            <form onSubmit={handleEditSubmit} className="admin-form">
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input required type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" value={formData.workEmail} onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Designation</label>
                  <input required type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Department</label>
                  <input required type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Account Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 6, backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
