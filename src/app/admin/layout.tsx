import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminLayoutClient } from "@/components/ui/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAuthorized = user && user.primaryEmailAddress?.emailAddress === adminEmail;

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f', color: '#fff', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ color: '#ff4444', fontSize: '3rem', margin: 0, textShadow: '0 0 20px rgba(255, 68, 68, 0.4)' }}>Access Denied</h1>
        <p style={{ color: '#888', fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>
          Admin authorization strictly required. You do not have permission to view the Legezt Administration Console.<br /><br />
          If you are the administrator, please log in through the main website with authorized credentials.
        </p>
        <a href="https://mrlegezt.me" style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#000', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '20px', transition: 'all 0.2s ease' }}>
          ← Return to Main Website
        </a>
      </div>
    );
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
