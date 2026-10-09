import { NextRequest, NextResponse } from "next/server";
export async function forwardPost(request: NextRequest, resource: "orders" | "newsletter") {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const api = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  try {
    const response = await fetch(`${api.replace(/\/$/, "")}/api/${resource}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch { return NextResponse.json({ error: "Service unavailable" }, { status: 503 }); }
}
