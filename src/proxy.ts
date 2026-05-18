import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Define admin domains
  const isAdminDomain = hostname === "admin.mrlegezt.me" || hostname.startsWith("admin.localhost");

  if (isAdminDomain) {
    // Normalise pathname to remove duplicate slashes (e.g. //verify -> /verify)
    const pathname = url.pathname.replace(/\/+/g, "/");

    // If accessing Clerk authentication/verification paths, let them pass through natively
    const isAuthPath = pathname.startsWith("/sign-in") || 
                       pathname.startsWith("/sign-up") || 
                       pathname.startsWith("/verify") ||
                       pathname.startsWith("/api");

    if (isAuthPath) {
      return NextResponse.next();
    }

    // If accessing the root of the admin domain, rewrite to /admin
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin", req.url));
    }
    // If accessing a sub-path like /documents, rewrite to /admin/documents
    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
