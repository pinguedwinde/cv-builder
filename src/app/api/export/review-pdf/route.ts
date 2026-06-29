import { NextRequest, NextResponse } from "next/server";
import { getResumeById, getLatestReview } from "@/lib/db/queries";
import { generateReviewPdf } from "@/lib/exporters/analysis-pdf";
import type { Resume } from "@/lib/schemas/resume";
import type { ReviewResult } from "@/lib/ai/review";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resumeRecord = await getResumeById(resumeId);
  const reviewRecord = getLatestReview(resumeId);

  if (!resumeRecord) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (!reviewRecord) {
    return NextResponse.json({ error: "No review found for this resume" }, { status: 404 });
  }

  try {
    const resume = resumeRecord.data as Resume;
    const review = reviewRecord.data as unknown as ReviewResult;
    const candidateName = resume.basics?.name || "Candidat";

    const pdfBuffer = await generateReviewPdf(review, candidateName);

    const safeName = candidateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const filename = `revue-cv-${safeName}.pdf`;

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
