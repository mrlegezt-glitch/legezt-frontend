import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`, { cache: "no-store" });
    const responseText = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: res.status });
      } catch (parseErr) {
        console.error("Failed to parse GET documents JSON response:", responseText);
        return NextResponse.json({ error: "Invalid response format from backend", details: responseText }, { status: 502 });
      }
    }

    return NextResponse.json({ error: "Failed to fetch documents", details: responseText }, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error GET /api/documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents from backend", details: error.message || error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    // Parse the multipart form data sent by the client
    const clientFormData = await req.formData();
    
    // Construct a standard FormData payload for the backend API
    const backendFormData = new FormData();

    for (const [key, value] of clientFormData.entries()) {
      if (value instanceof File) {
        backendFormData.append(key, value, value.name);
      } else {
        backendFormData.append(key, value);
      }
    }

    const headers: HeadersInit = {
      "Authorization": `Bearer ${token}`
      // Note: Do NOT set Content-Type header manually here. Node/Next fetch will 
      // automatically generate the correct boundary string and set the Content-Type header.
    };

    const res = await fetch(`${API_BASE_URL}/api/documents`, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    const responseText = await res.text();
    const responseContentType = res.headers.get("content-type") || "";

    if (responseContentType.includes("application/json")) {
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: res.status });
      } catch (parseErr) {
        console.error("Failed to parse POST documents JSON response:", responseText);
        return NextResponse.json({ error: "Invalid response format from backend", details: responseText }, { status: 502 });
      }
    }

    console.error(`Backend returned non-JSON response on POST (status: ${res.status}):`, responseText);
    return NextResponse.json(
      { error: `Backend error (status: ${res.status})`, details: responseText },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  } catch (error: any) {
    console.error("Proxy error POST /api/documents:", error);
    return NextResponse.json({ error: "Failed to upload document to backend", details: error.message || error }, { status: 500 });
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

    const responseText = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: res.status });
      } catch (parseErr) {
        console.error("Failed to parse DELETE document JSON response:", responseText);
        return NextResponse.json({ error: "Invalid response format from backend", details: responseText }, { status: 502 });
      }
    }

    return NextResponse.json({ error: "Failed to delete document", details: responseText }, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error DELETE /api/documents:", error);
    return NextResponse.json({ error: "Failed to delete document from backend", details: error.message || error }, { status: 500 });
  }
}

