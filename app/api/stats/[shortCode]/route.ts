import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidShortCode } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  if (!isValidShortCode(shortCode)) {
    return NextResponse.json(
      { error: "Invalid shortCode format. Must contain only letters, numbers, hyphens, or underscores." },
      { status: 400 }
    );
  }

  try {
    const record = await prisma.url.findUnique({
      where: { shortCode },
      select: {
        shortCode: true,
        originalUrl: true,
        clicks: true,
        createdAt: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Short URL not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
