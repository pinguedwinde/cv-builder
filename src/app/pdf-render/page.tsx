"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import { Suspense } from "react";

function PdfRenderContent() {
  const searchParams = useSearchParams();
  const themeId = searchParams.get("theme") || "modern";
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    const handler = () => {
      const data = (window as unknown as Record<string, { resume: Resume }>).__RESUME_DATA__;
      if (data?.resume) {
        setResume(data.resume);
      }
    };

    window.addEventListener("resume-data-ready", handler);
    handler();

    return () => window.removeEventListener("resume-data-ready", handler);
  }, []);

  if (!resume) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
        Loading resume data...
      </div>
    );
  }

  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "white" }}>
      <ThemeRenderer resume={resume} themeId={themeId as ThemeId} />
    </div>
  );
}

export default function PdfRenderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PdfRenderContent />
    </Suspense>
  );
}
