import { NextRequest, NextResponse } from "next/server";
import { getResumeById, saveReview } from "@/lib/db/queries";
import { reviewResume } from "@/lib/ai/review";
import type { Resume } from "@/lib/schemas/resume";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, resume: directResume } = body;

    let resume: Resume;

    if (directResume) {
      resume = directResume as Resume;
    } else if (resumeId) {
      const record = await getResumeById(resumeId);
      if (!record) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      resume = record.data as Resume;
    } else {
      return NextResponse.json({ error: "resumeId or resume is required" }, { status: 400 });
    }

    const result = await reviewResume(resume);

    if (resumeId) {
      saveReview(resumeId, result);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Failed to review resume" }, { status: 500 });
  }
}
