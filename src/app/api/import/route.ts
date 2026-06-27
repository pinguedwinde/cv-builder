import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/parsers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, format } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const result = parseResume(content, format);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid resume format", details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: result.data, format: result.format });
  } catch {
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
