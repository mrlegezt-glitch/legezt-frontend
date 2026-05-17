"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/documents", label: "Documents", icon: "📄" },
  { href: "/admin/services", label: "Services", icon: "🛠️" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
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
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={pathname === item.href ? "active" : ""}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div style={{ padding: "24px", marginTop: "auto", borderTop: "1px solid var(--border-color)" }}>
          <Link href="/" className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
            ← Back to Site
          </Link>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
