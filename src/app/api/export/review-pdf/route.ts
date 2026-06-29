import { NextRequest, NextResponse } from "next/server";
import { getResumeById, getLatestReview } from "@/lib/db/queries";
import { generateAnalysisPdf } from "@/lib/exporters/analysis-pdf";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const [resumeRecord, reviewRecord] = await Promise.all([
    getResumeById(resumeId),
    Promise.resolve(getLatestReview(resumeId)),
  ]);

  if (!resumeRecord) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (!reviewRecord) {
    return NextResponse.json({ error: "No review found for this resume" }, { status: 404 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pdfBuffer = await generateAnalysisPdf("review", resumeId, baseUrl);

    const candidateName = (resumeRecord.data as { basics?: { name?: string } }).basics?.name || "cv";
    const filename = `revue-${candidateName.toLowerCase().replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Review PDF export error:", err);
    return NextResponse.json({ error: "Failed to generate review PDF" }, { status: 500 });
  }
}
