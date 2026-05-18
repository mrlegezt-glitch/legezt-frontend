import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";

    const res = await fetch(`${API_BASE_URL}/api/admin/inbox?limit=${limit}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error GET /api/admin/inbox:", error);
    return NextResponse.json({ error: "Failed to dispatch inbox fetch proxy" }, { status: 500 });
  }
}
