"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { PdfModeProvider } from "@/lib/pdf-context";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import { Suspense } from "react";

const PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 0;
  }

  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: white;
  }

  .cv-entry {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .cv-section-title {
    break-after: avoid;
    page-break-after: avoid;
  }

  .cv-sidebar-fixed {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    height: 297mm !important;
    overflow: hidden !important;
    z-index: 10;
  }
`;

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

  useEffect(() => {
    if (!resume) return;
    // Two rAF calls ensure the DOM is fully painted before signalling ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        (window as unknown as Record<string, unknown>).__PDF_READY__ = true;
        window.dispatchEvent(new CustomEvent("pdf-render-ready"));
      });
    });
  }, [resume]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div style={{ width: "210mm", backgroundColor: "white" }}>
        <PdfModeProvider value={true}>
          {resume ? (
            <ThemeRenderer resume={resume} themeId={themeId as ThemeId} />
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
              Loading resume data...
            </div>
          )}
        </PdfModeProvider>
      </div>
    </>
  );
}

export default function PdfRenderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PdfRenderContent />
    </Suspense>
  );
}
