import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const links = await db.shortUrl.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const baseUrl = getBaseUrl(request);

    const formatted = links.map((link) => ({
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      shortUrl: `${baseUrl}/${link.shortCode}`,
      title: link.title,
      clicks: link.clicks,
      createdAt: link.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Gagal mengambil link" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, shortCode } = body;

    if (!id || !shortCode) {
      return NextResponse.json(
        { error: "ID dan short code diperlukan" },
        { status: 400 }
      );
    }

    const code = String(shortCode).trim();

    // Validate format: alphanumeric, dash, underscore, 3-30 chars
    if (!/^[A-Za-z0-9_-]{3,30}$/.test(code)) {
      return NextResponse.json(
        { error: "Short code hanya boleh huruf, angkat, strip, dan underscore. Minimal 3 karakter." },
        { status: 400 }
      );
    }

    // Reserved routes
    const reserved = ["login", "register", "dashboard", "api", "_next", "favicon"];
    if (reserved.includes(code.toLowerCase())) {
      return NextResponse.json(
        { error: `"${code}" sudah digunakan oleh sistem.` },
        { status: 400 }
      );
    }

    // Ensure user owns the link
    const link = await db.shortUrl.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check uniqueness if changed
    if (code !== link.shortCode) {
      const existing = await db.shortUrl.findUnique({
        where: { shortCode: code },
      });
      if (existing) {
        return NextResponse.json(
          { error: `"${code}" sudah dipakai. Coba yang lain.` },
          { status: 409 }
        );
      }
    }

    const updated = await db.shortUrl.update({
      where: { id },
      data: { shortCode: code },
    });

    const baseUrl = getBaseUrl(request);

    return NextResponse.json({
      id: updated.id,
      originalUrl: updated.originalUrl,
      shortCode: updated.shortCode,
      shortUrl: `${baseUrl}/${updated.shortCode}`,
      title: updated.title,
      clicks: updated.clicks,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Gagal mengubah short code" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID diperlukan" },
        { status: 400 }
      );
    }

    // Ensure user owns the link
    const link = await db.shortUrl.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.shortUrl.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Gagal menghapus link" },
      { status: 500 }
    );
  }
}

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}