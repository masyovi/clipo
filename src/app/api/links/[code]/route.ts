import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const link = await db.shortUrl.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Increment click count
    await db.shortUrl.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    // Redirect to original URL
    return NextResponse.redirect(link.originalUrl, 307);
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.json(
      { error: "Failed to redirect" },
      { status: 500 }
    );
  }
}