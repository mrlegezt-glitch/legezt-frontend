import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const PORTAL_API_URL = process.env.PORTAL_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://portal.mrlegezt.me");
const ADMIN_API_KEY = "LeGeZt_Admin_API_Key_2025_X9mK!@#";

async function verifyAdminAuth() {
  const { getToken } = await auth();
  const token = await getToken();
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    if (!await verifyAdminAuth()) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const res = await fetch(`${PORTAL_API_URL}/api/admin/portal-faculties`, {
      method: "GET",
      headers: {
        "x-admin-api-key": ADMIN_API_KEY
      },
      cache: "no-store"
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error GET /api/admin/portal-faculties:", error);
    return NextResponse.json({ error: "Failed to fetch portal faculties" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await verifyAdminAuth()) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const res = await fetch(`${PORTAL_API_URL}/api/admin/portal-faculties`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-api-key": ADMIN_API_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error PATCH /api/admin/portal-faculties:", error);
    return NextResponse.json({ error: "Failed to update portal faculty" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await verifyAdminAuth()) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const res = await fetch(`${PORTAL_API_URL}/api/admin/portal-faculties`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-api-key": ADMIN_API_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error DELETE /api/admin/portal-faculties:", error);
    return NextResponse.json({ error: "Failed to delete portal faculty" }, { status: 500 });
  }
}
