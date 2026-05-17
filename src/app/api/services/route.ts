import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error GET /api/services:", error);
    return NextResponse.json({ error: "Failed to fetch services from backend" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error POST /api/services:", error);
    return NextResponse.json({ error: "Failed to create service in backend" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/api/services`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error PUT /api/services:", error);
    return NextResponse.json({ error: "Failed to update service in backend" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const res = await fetch(`${API_BASE_URL}/api/services?id=${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error DELETE /api/services:", error);
    return NextResponse.json({ error: "Failed to delete service in backend" }, { status: 500 });
  }
}
