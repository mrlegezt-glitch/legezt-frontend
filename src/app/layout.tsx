import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Legezt — Professional Document Distribution Platform",
  description: "Premium portfolio platform with PDF distribution, professional services, and live resume. Built for legezt.app.",
  keywords: ["portfolio", "documents", "PDF", "resume", "services", "legezt"],
  openGraph: {
    title: "Legezt — Professional Document Distribution Platform",
    description: "Premium portfolio platform with PDF distribution, professional services, and live resume.",
    url: "https://legezt.app",
    siteName: "Legezt",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Navbar />
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
