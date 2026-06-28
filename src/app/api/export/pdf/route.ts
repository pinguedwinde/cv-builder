import { NextRequest, NextResponse } from "next/server";
import { getResumeById } from "@/lib/db/queries";
import { exportResume, type ExportFormat } from "@/lib/exporters";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import { generatePdf } from "@/lib/exporters/pdf";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const theme = searchParams.get("theme") || "modern";
  const colorTheme = searchParams.get("colorTheme") || "default";
  const format = searchParams.get("format") || "pdf";

  if (!id) {
    return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
  }

  try {
    const resumeRecord = await getResumeById(id);
    if (!resumeRecord) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resume = resumeRecord.data as Resume;

    if (format === "pdf") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const pdfBuffer = await generatePdf(resume, theme as ThemeId, baseUrl, colorTheme);

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${resume.basics?.name || "cv"}.pdf"`,
        },
      });
    }

    const exported = exportResume(resume, format as ExportFormat);
    const mimeTypes: Record<string, string> = {
      yaml: "text/yaml",
      json: "application/json",
      markdown: "text/markdown",
    };
    const extensions: Record<string, string> = {
      yaml: "yml",
      json: "json",
      markdown: "md",
    };

    return new NextResponse(exported, {
      headers: {
        "Content-Type": mimeTypes[format] || "text/plain",
        "Content-Disposition": `attachment; filename="${resume.basics?.name || "cv"}.${extensions[format]}"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to export resume" }, { status: 500 });
  }
}
