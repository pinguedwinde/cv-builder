import { NextRequest, NextResponse } from "next/server";
import { getResumeById, getLatestMatch, getMatchByVersion } from "@/lib/db/queries";
import { generateMatchPdf } from "@/lib/exporters/analysis-pdf";
import type { Resume } from "@/lib/schemas/resume";
import type { MatchResult } from "@/lib/ai/matching";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");
  const versionParam = searchParams.get("version");

  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resumeRecord = await getResumeById(resumeId);
  const matchRecord = versionParam
    ? getMatchByVersion(resumeId, parseInt(versionParam, 10))
    : getLatestMatch(resumeId);

  if (!resumeRecord) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (!matchRecord) {
    return NextResponse.json({ error: "No match analysis found for this resume" }, { status: 404 });
  }

  try {
    const resume = resumeRecord.data as Resume;
    const match = matchRecord.data as unknown as MatchResult;
    const candidateName = resume.basics?.name || "Candidat";
    const jobTitle = matchRecord.jobTitle ?? null;

    const pdfBuffer = await generateMatchPdf(match, candidateName, jobTitle, {
      jobType: matchRecord.jobType,
      jobUrl: matchRecord.jobUrl,
      jobDescription: matchRecord.jobDescription,
    });

    const safeName = candidateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const safeJob = jobTitle
      ? "-" + jobTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      : "";
    const filename = `matching-${safeName}${safeJob}-v${matchRecord.version}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Match PDF export error:", err);
    return NextResponse.json({ error: "Failed to generate match PDF" }, { status: 500 });
  }
}
