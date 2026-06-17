import { NextRequest, NextResponse } from "next/server";

// App routes that should serve the main page
const APP_ROUTES = ["/login", "/register", "/dashboard"];

// Short codes are nanoid: alphanumeric, no dashes/underscores, 6-12 chars
const SHORT_CODE_REGEX = /^[A-Za-z0-9_-]{6,12}$/;

const SKIP_PATHS = [
  "api",
  "_next",
  "favicon",
  "robots.txt",
  "logo.svg",
  "hero-illustration.png",
];

export async function proxy(request: NextRequest): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl;

  // ── App route rewrites (serve main page.tsx) ──
  if (APP_ROUTES.includes(pathname)) {
    return NextResponse.rewrite(new URL("/", request.url));
  }

  // ── Short URL redirect ──
  // Only handle root-level paths (no nested slashes)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return;

  const possibleCode = segments[0];

  // Skip known paths
  if (SKIP_PATHS.some((p) => possibleCode.startsWith(p))) return;

  // Skip app-like words that aren't short codes
  if (["login", "register", "dashboard"].includes(possibleCode)) return;

  // Check if it looks like a short code
  if (!SHORT_CODE_REGEX.test(possibleCode)) return;

  // Skip if it looks like a file extension
  if (possibleCode.includes(".")) return;

  // Dynamic import to avoid issues at module level
  const { db } = await import("@/lib/db");

  try {
    const link = await db.shortUrl.findUnique({
      where: { shortCode: possibleCode },
    });

    if (link) {
      // Increment click count in background
      db.shortUrl.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } },
      }).catch(() => {});

      // Redirect to original URL
      return NextResponse.redirect(link.originalUrl, 307);
    }
  } catch {
    // Let it fall through to Next.js
  }
}