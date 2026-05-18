"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function VerifyPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push("/admin");
      } else {
        router.push("/sign-in");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a14', color: '#fff', flexDirection: 'column', gap: '20px' }}>
      <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,15,58,0.2)', borderTopColor: '#ff0f3a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 800 }}>
        Verifying Account...
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        Please wait while we secure your session.
      </p>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
