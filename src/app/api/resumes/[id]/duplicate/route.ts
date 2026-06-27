import { NextRequest, NextResponse } from "next/server";
import { duplicateResume } from "@/lib/db/queries";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const resume = await duplicateResume(id);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json(resume, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to duplicate resume" }, { status: 500 });
  }
}
