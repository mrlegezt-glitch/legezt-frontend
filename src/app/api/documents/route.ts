import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

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
    const { getToken } = await auth();
    const token = await getToken();

    const formData = await req.formData();
    const res = await fetch(`${API_BASE_URL}/api/documents`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error POST /api/documents:", error);
    return NextResponse.json({ error: "Failed to upload document to backend" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const res = await fetch(`${API_BASE_URL}/api/documents?id=${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error DELETE /api/documents:", error);
    return NextResponse.json({ error: "Failed to delete document from backend" }, { status: 500 });
  }
}
