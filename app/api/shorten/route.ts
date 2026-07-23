import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Extract IP address from request headers or fallback to default
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Enforce 5 requests per minute per IP limit
    const { allowed, remaining, resetAt } = rateLimit(ip, 5, 60_000);

    if (!allowed) {
      const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": remaining.toString(),
          },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { url } = body;

    // Validate URL using lib/validation
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format. Must start with http:// or https://" },
        { status: 400 }
      );
    }

    // Generate a unique short code
    const shortCode = nanoid(7);

    // Save to database
    const record = await prisma.url.create({
      data: {
        shortCode,
        originalUrl: url,
      },
    });

    // Build the short URL using the request's origin
    const origin = request.nextUrl.origin;
    const shortUrl = `${origin}/${record.shortCode}`;

    return NextResponse.json({ shortUrl, shortCode: record.shortCode });
  } catch (error) {
    console.error("Error shortening URL:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
