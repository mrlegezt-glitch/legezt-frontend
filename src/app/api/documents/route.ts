import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error GET /api/documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents from backend" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${API_BASE_URL}/api/documents`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error POST /api/documents:", error);
    return NextResponse.json({ error: "Failed to upload document to backend" }, { status: 500 });
  }
}
