"use client";

import { useState } from "react";
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { 
    label: "Faculties", 
    Icon: GraduationCap,
    isSubmenu: true,
    children: [
      { href: "/admin/faculties", label: "Faculties Directory" },
      { href: "/admin/portal-faculties", label: "Portal Faculties" }
    ]
  },
  { 
    label: "Students", 
    Icon: Users,
    isSubmenu: true,
    children: [
      { href: "/admin/students", label: "Students Directory" },
      { href: "/admin/portal-students", label: "Portal Students" }
    ]
  },
  { href: "/admin/team", label: "Team Members", Icon: Briefcase },
  { href: "/admin/documents", label: "Documents", Icon: FileText },
  { href: "/admin/services", label: "Services", Icon: Sliders },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/email", label: "Email Workspace", Icon: Send },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(true);
  const [isFacultyMenuOpen, setIsFacultyMenuOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      {isMobileOpen && <div className="admin-mobile-overlay" onClick={() => setIsMobileOpen(false)} />}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div style={{ padding: "0 24px", marginBottom: 32, position: "relative", minHeight: "24px" }}>
          <div className="sidebar-title-text" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--text-muted)", transition: "opacity 0.2s" }}>
            Admin Panel
          </div>
        </div>
        
        <ul className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.isSubmenu) {
              const isActive = item.children?.some(child => pathname === child.href);
              const IconComponent = item.Icon;
              const isOpen = item.label === "Students" ? isStudentMenuOpen : isFacultyMenuOpen;
              return (
                <li key={idx} style={{ marginBottom: "18px" }}>
                  <button 
                    className={`sidebar-3d-button ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (isCollapsed) setIsCollapsed(false);
                      if (item.label === "Students") {
                        setIsStudentMenuOpen(!isStudentMenuOpen);
                      } else {
                        setIsFacultyMenuOpen(!isFacultyMenuOpen);
                      }
                    }}
                  >
                    <span className="btn-3d-shadow"></span>
                    <span className="btn-3d-edge"></span>
                    <span className="btn-3d-front" style={{ justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="btn-3d-icon-box">
                          <IconComponent className="btn-3d-icon" size={18} />
                        </span>
                        <span className="btn-3d-label">{item.label}</span>
                      </div>
                      <span className="submenu-chevron" style={{ color: "var(--text-muted)", display: "flex" }}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </span>
                  </button>
                  {isOpen && !isCollapsed && item.children && (
                    <ul className="sidebar-submenu">
                      {item.children.map((child) => (
                        <li key={child.href} className="sidebar-submenu-item">
                          <Link 
                            href={child.href} 
                            className={`sidebar-submenu-link ${pathname === child.href ? 'active' : ''}`}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            const isActive = pathname === item.href;
            const IconComponent = item.Icon;
            return (
              <li key={item.href || idx} style={{ marginBottom: "18px" }}>
                <Link href={item.href!} className={`sidebar-3d-button ${isActive ? "active" : ""}`} onClick={() => setIsMobileOpen(false)}>
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
              <ArrowLeft className="btn-3d-icon" size={18} style={{ marginRight: isCollapsed ? 0 : 8 }} />
              <span className="btn-3d-label">{isCollapsed ? "" : "Back to Site"}</span>
            </span>
          </Link>
        </div>
      </aside>
      <div className={`admin-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-mobile-header">
          <button onClick={() => setIsMobileOpen(true)} className="admin-mobile-toggle">
            <Menu size={24} />
          </button>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: "bold", letterSpacing: "1px" }}>Admin Panel</div>
        </div>
        {children}
      </div>
    </div>
  );
}
