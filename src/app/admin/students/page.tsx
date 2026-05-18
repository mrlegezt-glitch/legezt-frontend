"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface Student {
  id: string;
  name: string;
  enrollmentNo: string;
  course: string;
  batchYear: string;
  email: string | null;
  createdAt: string;
}

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", enrollmentNo: "", course: "", batchYear: "", email: "" });
  const { getToken } = useAuth();

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: "", enrollmentNo: "", course: "", batchYear: "", email: "" });
      fetchStudents();
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      });
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>🎓 Student Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Student</button>
      </div>

      <div className="admin-card">
        {isLoading ? (
          <p>Loading students...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Enrollment No.</th>
                <th>Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center" }}>No students found.</td></tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id}>
                    <td>{stu.enrollmentNo}</td>
                    <td>{stu.name}</td>
                    <td>{stu.course}</td>
                    <td>{stu.batchYear}</td>
                    <td>{stu.email || "N/A"}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(stu.id)}>Delete</button>
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
            <h2>Add Student</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Enrollment Number</label>
                <input required type="text" value={formData.enrollmentNo} onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Course</label>
                <input required type="text" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Batch Year</label>
                <input required type="text" value={formData.batchYear} onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
