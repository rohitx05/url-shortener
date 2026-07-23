import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { isValidShortCode } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  // Validate short code format
  if (!isValidShortCode(shortCode)) {
    return NextResponse.redirect(new URL("/not-found", _request.url), 307);
  }

  let originalUrl: string | null = null;

  // 1. Try fetching from Redis cache first with graceful fallback
  try {
    originalUrl = await redis.get<string>(`url:${shortCode}`);
  } catch (error) {
    console.error("Redis cache error:", error);
  }

  // 2. If not found in cache, query PostgreSQL via Prisma
  if (!originalUrl) {
    try {
      const record = await prisma.url.findUnique({
        where: { shortCode },
        select: { originalUrl: true },
      });

      if (!record) {
        return NextResponse.redirect(new URL("/not-found", _request.url), 307);
      }

      originalUrl = record.originalUrl;

      // Cache the URL mapping in Redis with 1-hour TTL (3600 seconds)
      try {
        await redis.set(`url:${shortCode}`, originalUrl, { ex: 3600 });
      } catch (error) {
        console.error("Redis set error:", error);
      }
    } catch (error) {
      console.error("Database query error:", error);
      return NextResponse.redirect(new URL("/not-found", _request.url), 307);
    }
  }

  // 3. Atomically increment click count in PostgreSQL asynchronously/non-blocking
  prisma.url
    .update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    })
    .catch((err: unknown) => {
      console.error("Failed to increment click count:", err);
    });

  // 4. Redirect to the original URL
  return NextResponse.redirect(originalUrl, 308);
}
