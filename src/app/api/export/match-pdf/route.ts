import { NextRequest, NextResponse } from "next/server";
import { getResumeById, getLatestMatch } from "@/lib/db/queries";
import { generateAnalysisPdf } from "@/lib/exporters/analysis-pdf";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const [resumeRecord, matchRecord] = await Promise.all([
    getResumeById(resumeId),
    Promise.resolve(getLatestMatch(resumeId)),
  ]);

  if (!resumeRecord) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (!matchRecord) {
    return NextResponse.json({ error: "No match analysis found for this resume" }, { status: 404 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pdfBuffer = await generateAnalysisPdf("match", resumeId, baseUrl);

    const candidateName = (resumeRecord.data as { basics?: { name?: string } }).basics?.name || "cv";
    const jobTitle = matchRecord.jobTitle ? `-${matchRecord.jobTitle.toLowerCase().replace(/\s+/g, "-")}` : "";
    const filename = `matching-${candidateName.toLowerCase().replace(/\s+/g, "-")}${jobTitle}.pdf`;

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
