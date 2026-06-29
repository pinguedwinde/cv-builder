import { NextRequest, NextResponse } from "next/server";
import { getLatestMatch, getMatchHistory } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const { resumeId } = await params;
    const latest = getLatestMatch(resumeId);
    const history = getMatchHistory(resumeId);
    return NextResponse.json({ latest, history });
  } catch (err) {
    console.error("Matches fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
