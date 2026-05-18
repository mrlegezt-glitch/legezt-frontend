"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user && user.primaryEmailAddress?.emailAddress === adminEmail;

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
            <li>
              <a 
                href={process.env.NODE_ENV === "development" ? "http://admin.localhost:3000" : "https://admin.mrlegezt.me"} 
                onClick={() => setMobileOpen(false)} 
                style={{ color: "var(--accent-primary)", fontWeight: "bold" }}
              >
                Admin Console
              </a>
            </li>
          )}
          <Show when="signed-out">
            <li className="mobile-auth-links">
              <SignInButton>
                <button className="btn btn-secondary btn-sm" style={{ width: "100%", marginBottom: "12px" }} onClick={() => setMobileOpen(false)}>Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setMobileOpen(false)}>Sign Up</button>
              </SignUpButton>
            </li>
          </Show>
        </ul>

        <div className="nav-auth">
          <Show when="signed-out">
            <div className="desktop-auth-only">
              <SignInButton>
                <button className="btn btn-secondary btn-sm">Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button className="btn btn-primary btn-sm">Sign Up</button>
              </SignUpButton>
            </div>
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
