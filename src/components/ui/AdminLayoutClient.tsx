"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Briefcase, 
  FileText, 
  Sliders, 
  Mail, 
  Send, 
  ArrowLeft 
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/faculties", label: "Faculties", Icon: GraduationCap },
  { href: "/admin/students", label: "Students Directory", Icon: Users },
  { href: "/admin/portal-students", label: "Portal Students", Icon: Users },
  { href: "/admin/team", label: "Team Members", Icon: Briefcase },
  { href: "/admin/documents", label: "Documents", Icon: FileText },
  { href: "/admin/services", label: "Services", Icon: Sliders },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/email", label: "Email Workspace", Icon: Send },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--text-muted)" }}>
            Admin Panel
          </div>
        </div>
        <ul className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.Icon;
            return (
              <li key={item.href} style={{ marginBottom: "18px" }}>
                <Link href={item.href} className={`sidebar-3d-button ${isActive ? "active" : ""}`}>
                  <span className="btn-3d-shadow"></span>
                  <span className="btn-3d-edge"></span>
                  <span className="btn-3d-front">
                    <span className="btn-3d-icon-box">
                      <IconComponent className="btn-3d-icon" size={18} />
                    </span>
                    <span className="btn-3d-label">{item.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div style={{ padding: "24px", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" className="sidebar-3d-button back-btn">
            <span className="btn-3d-shadow"></span>
            <span className="btn-3d-edge"></span>
            <span className="btn-3d-front" style={{ justifyContent: "center", padding: "10px 20px" }}>
              <ArrowLeft className="btn-3d-icon" size={18} style={{ marginRight: 8 }} />
              <span className="btn-3d-label">Back to Site</span>
            </span>
          </Link>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
