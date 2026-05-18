import { currentUser } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { AdminLayoutClient } from "@/components/ui/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  // 1. If not logged in, render Clerk's SignIn card directly on the admin subdomain
  if (!user) {
    return (
      <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '1.5px', textShadow: '0 0 20px rgba(255, 15, 58, 0.2)' }}>
            LEGEZT ADMIN
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
            Authorized Administration Console Access
          </p>
        </div>
        <div className="auth-card-clerk">
          <SignIn />
        </div>
      </div>
    );
  }

  // 2. If logged in but not admin, show Access Denied
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAuthorized = (
    user.primaryEmailAddress?.emailAddress === "mdjbjibran@gmail.com" ||
    user.primaryEmailAddress?.emailAddress === "mdjibjibran@gmail.com" ||
    user.primaryEmailAddress?.emailAddress === adminEmail
  );

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f', color: '#fff', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ color: '#ff4444', fontSize: '3rem', margin: 0, textShadow: '0 0 20px rgba(255, 68, 68, 0.4)' }}>Access Denied</h1>
        <p style={{ color: '#888', fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>
          Admin authorization strictly required. You do not have permission to view the Legezt Administration Console.<br /><br />
          Current User: <strong>{user.primaryEmailAddress?.emailAddress}</strong>
        </p>
        <a href="https://mrlegezt.me" style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#000', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '20px', transition: 'all 0.2s ease' }}>
          ← Return to Main Website
        </a>
      </div>
    );
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
