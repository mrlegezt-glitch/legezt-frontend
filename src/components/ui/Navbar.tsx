"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();

  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  const isAdmin = user && (user.id === adminId || user.username === adminId);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="Legezt Logo" className="nav-logo-img" />
          <span className="nav-logo-text">LEGEZT</span>
        </Link>

        <ul className={`nav-links ${mobileOpen ? "open" : ""}`}>
          <li><Link href="/" onClick={() => setMobileOpen(false)}>Home</Link></li>
          <li><Link href="/services" onClick={() => setMobileOpen(false)}>Services</Link></li>
          <li><Link href="/documents" onClick={() => setMobileOpen(false)}>Documents</Link></li>
          <li><Link href="/resume" onClick={() => setMobileOpen(false)}>Resume</Link></li>
          <li><Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link></li>
          {userId && isAdmin && (
            <li><Link href="/admin" onClick={() => setMobileOpen(false)} style={{ color: "var(--accent-primary)" }}>Admin</Link></li>
          )}
        </ul>

        <div className="nav-auth">
          <Show when="signed-out">
            <SignInButton>
              <button className="btn btn-secondary btn-sm">Sign In</button>
            </SignInButton>
            <SignUpButton>
              <button className="btn btn-primary btn-sm">Sign Up</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: { width: 36, height: 36 },
                },
              }}
            />
          </Show>

          <div className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}
