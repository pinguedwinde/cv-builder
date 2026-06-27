import { NextRequest, NextResponse } from "next/server";
import { getResumeById } from "@/lib/db/queries";
import { matchResumeToJob, optimizeResumeForJob } from "@/lib/ai/matching";
import { parseJobDescription } from "@/lib/parsers/job-description";
import type { Resume } from "@/lib/schemas/resume";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let resumeId: string | undefined;
    let resume: Resume | undefined;
    let jobType: "text" | "url" | "pdf" = "text";
    let jobContent: string | Buffer = "";
    let optimize = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      resumeId = formData.get("resumeId") as string | undefined;
      jobType = (formData.get("jobType") as "text" | "url" | "pdf") || "text";
      optimize = formData.get("optimize") === "true";

      if (jobType === "pdf") {
        const file = formData.get("file") as File;
        if (!file) {
          return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
        }
        const arrayBuffer = await file.arrayBuffer();
        jobContent = Buffer.from(arrayBuffer);
      } else {
        jobContent = (formData.get("content") as string) || "";
      }
    } else {
      const body = await request.json();
      resumeId = body.resumeId;
      resume = body.resume;
      jobType = body.jobType || "text";
      jobContent = body.jobContent || "";
      optimize = body.optimize || false;
    }

    if (!resume && resumeId) {
      const record = await getResumeById(resumeId);
      if (!record) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      resume = record.data as Resume;
    }

    if (!resume) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }

    if (!jobContent) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const jobDescription = await parseJobDescription({ type: jobType, content: jobContent });
    const matchResult = await matchResumeToJob(resume, jobDescription);

    if (optimize) {
      const optimizedResume = await optimizeResumeForJob(resume, jobDescription);
      return NextResponse.json({ ...matchResult, optimizedResume });
    }

    return NextResponse.json(matchResult);
  } catch (err) {
    console.error("Match error:", err);
    return NextResponse.json(
      { error: "Failed to match resume to job", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
