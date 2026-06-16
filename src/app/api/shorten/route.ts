import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url: originalUrl, title } = body;

    if (!originalUrl || typeof originalUrl !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      const urlToParse = originalUrl.match(/^https?:\/\//)
        ? originalUrl
        : `https://${originalUrl}`;
      parsedUrl = new URL(urlToParse);
    } catch {
      return NextResponse.json(
        { error: "Format URL tidak valid" },
        { status: 400 }
      );
    }

    const finalUrl = parsedUrl.toString();

    // Check if URL already exists for this user
    const existing = await db.shortUrl.findFirst({
      where: { originalUrl: finalUrl, userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        originalUrl: existing.originalUrl,
        shortCode: existing.shortCode,
        title: existing.title,
        clicks: existing.clicks,
        createdAt: existing.createdAt,
        shortUrl: `${getBaseUrl()}/${existing.shortCode}`,
      });
    }

    // Generate unique short code
    let shortCode = nanoid(6);
    let attempts = 0;
    while (await db.shortUrl.findUnique({ where: { shortCode } })) {
      shortCode = nanoid(6);
      attempts++;
      if (attempts > 10) {
        shortCode = nanoid(8);
      }
    }

    const shortUrl = await db.shortUrl.create({
      data: {
        originalUrl: finalUrl,
        shortCode,
        title: title || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: shortUrl.id,
        originalUrl: shortUrl.originalUrl,
        shortCode: shortUrl.shortCode,
        title: shortUrl.title,
        clicks: shortUrl.clicks,
        createdAt: shortUrl.createdAt,
        shortUrl: `${getBaseUrl()}/${shortUrl.shortCode}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating short URL:", error);
    return NextResponse.json(
      { error: "Gagal membuat URL pendek" },
      { status: 500 }
    );
  }
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  return "alamatweb.my.id";
}