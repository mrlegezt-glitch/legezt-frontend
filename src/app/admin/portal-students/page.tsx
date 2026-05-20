"use client";

import { useState, useEffect } from "react";
import { Edit, Trash, Check, Search, RefreshCw, X, ShieldAlert, CheckCircle } from "lucide-react";
import { globalPrefetcher } from "@/lib/greedyOptimizer";

interface PortalStudent {
  id: string;
  fullName: string;
  username: string;
  email: string;
  enrollmentNo: string;
  year: number;
  branch: string;
  collegeName: string;
  status: string;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function PortalStudentsAdminPage() {
  const [students, setStudents] = useState<PortalStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<PortalStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PortalStudent | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    enrollmentNo: "",
    year: "1",
    branch: "",
    status: "pending"
  });

  const fetchStudents = async () => {
    try {
      const cached = globalPrefetcher?.getCachedData("/api/admin/portal-students");
      if (cached) {
        setStudents(cached.students || []);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      
      const res = await fetch("/api/admin/portal-students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        globalPrefetcher?.prefetch("/api/admin/portal-students");
      }
    } catch (error) {
      console.error("Error fetching portal students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (stu) =>
        stu.fullName.toLowerCase().includes(query) ||
        stu.email.toLowerCase().includes(query) ||
        stu.enrollmentNo.toLowerCase().includes(query) ||
        stu.branch.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const handleApprove = async (studentId: string) => {
    const rollbackStudents = [...students];
    setStudents(prev =>
      prev.map(stu => stu.id === studentId ? { ...stu, status: "approved" } : stu)
    );

    try {
      const res = await fetch("/api/admin/portal-students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, status: "approved" }),
      });
      if (!res.ok) {
        setStudents(rollbackStudents);
      }
    } catch (error) {
      console.error("Error approving student:", error);
      setStudents(rollbackStudents);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student and all their portal data?")) return;
    const rollbackStudents = [...students];
    setStudents(prev => prev.filter(stu => stu.id !== studentId));

    try {
      const res = await fetch("/api/admin/portal-students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        setStudents(rollbackStudents);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setStudents(rollbackStudents);
    }
  };

  const openEditModal = (stu: PortalStudent) => {
    setSelectedStudent(stu);
    setFormData({
      fullName: stu.fullName,
      username: stu.username,
      email: stu.email,
      enrollmentNo: stu.enrollmentNo,
      year: stu.year.toString(),
      branch: stu.branch,
      status: stu.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const rollbackStudents = [...students];
    setStudents(prev =>
      prev.map(stu =>
        stu.id === selectedStudent.id
          ? {
              ...stu,
              fullName: formData.fullName,
              username: formData.username,
              email: formData.email,
              enrollmentNo: formData.enrollmentNo,
              year: parseInt(formData.year),
              branch: formData.branch,
              status: formData.status
            }
          : stu
      )
    );
    setIsEditModalOpen(false);

    try {
      const res = await fetch("/api/admin/portal-students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          ...formData
        }),
      });
      if (!res.ok) {
        setStudents(rollbackStudents);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setStudents(rollbackStudents);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Portal Student Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Manage registered portal accounts, verify emails/status, and update details.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStudents} disabled={isLoading} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={14} className={isLoading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div style={{ margin: "20px 0", display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by name, email, branch, or enrollment number..."
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
          <p style={{ padding: 20 }}>Loading portal students...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Enrollment No.</th>
                  <th>Branch & Year</th>
                  <th>Credentials</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px 20px" }}>
                      No portal students found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr key={stu.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{stu.fullName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Registered: {new Date(stu.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td><code>{stu.enrollmentNo}</code></td>
                      <td>
                        <div>{stu.branch}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Year {stu.year}</div>
                      </td>
                      <td>
                        <div>{stu.email}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>@{stu.username}</div>
                      </td>
                      <td>
                        <span className={`badge ${stu.status === "approved" ? "badge-green" : stu.status === "pending" ? "badge-purple" : "badge-red"}`} style={{ textTransform: "capitalize" }}>
                          {stu.status}
                        </span>
                      </td>
                      <td>
                        {stu.lastLoginAt ? (
                          <div style={{ fontSize: "0.85rem" }}>{new Date(stu.lastLoginAt).toLocaleString()}</div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Never logged in</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {stu.status === "pending" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(stu.id)}
                              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#10b981", borderColor: "#10b981", color: "#fff" }}
                              title="Approve student account"
                            >
                              <Check size={14} /> Approve
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(stu)}
                            style={{ padding: "4px 8px" }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(stu.id)}
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
            <h2>Edit Student Details</h2>
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
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Enrollment Number</label>
                <input required type="text" value={formData.enrollmentNo} onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Year</label>
                  <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 6, backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Branch</label>
                  <input required type="text" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                </div>
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
