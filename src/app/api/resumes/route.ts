import { NextRequest, NextResponse } from "next/server";
import { getAllResumes, createResume } from "@/lib/db/queries";
import { validateResume, createEmptyResume } from "@/lib/schemas/resume";

export async function GET() {
  try {
    const resumes = await getAllResumes();
    return NextResponse.json(resumes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, data, theme } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const resumeData = data ? validateResume(data) : { success: true, data: createEmptyResume() };

    if (!resumeData.success || !resumeData.data) {
      return NextResponse.json(
        { error: "Invalid resume data", details: resumeData.errors },
        { status: 400 }
      );
    }

    const resume = await createResume({
      title,
      data: resumeData.data,
      theme: theme || "modern",
    });

    return NextResponse.json(resume, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
