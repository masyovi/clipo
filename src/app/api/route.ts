import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const isConfigured = clientId && !clientId.startsWith("your-");

  return NextResponse.json({
    googleAuthConfigured: isConfigured,
  });
}