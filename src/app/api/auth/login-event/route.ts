import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/login-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error POST /api/auth/login-event:", error);
    return NextResponse.json({ error: "Failed to dispatch login event proxy" }, { status: 500 });
  }
}
