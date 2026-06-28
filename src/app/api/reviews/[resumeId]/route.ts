import { NextRequest, NextResponse } from "next/server";
import { getLatestReview, getReviewHistory } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const { resumeId } = await params;
    const latest = getLatestReview(resumeId);
    const history = getReviewHistory(resumeId);
    return NextResponse.json({ latest, history });
  } catch (err) {
    console.error("Reviews fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
