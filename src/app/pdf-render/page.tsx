"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { PdfModeProvider } from "@/lib/pdf-context";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import { resolveColorPalette } from "@/themes";
import { Suspense } from "react";

const SIDEBAR_WIDTHS: Record<string, string> = {
  modern: "74mm",
  swiss: "53mm",
};

const SIDEBAR_BGS_FALLBACK: Record<string, string> = {
  modern: "#334155",
  swiss: "#111111",
};

function buildBodyResetCss(): string {
  return `
    html { height: auto !important; background: white !important; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      display: block !important;
      flex-direction: unset !important;
      min-height: unset !important;
      height: auto !important;
      color: initial !important;
    }
  `;
}

function buildPagedCss(themeId: string, colorTheme: string): string {
  const sidebarWidth = SIDEBAR_WIDTHS[themeId];
  const resolvedPalette = resolveColorPalette(themeId, colorTheme);
  const sidebarBg =
    resolvedPalette?.colors?.sidebarBg ??
    resolvedPalette?.colors?.black ??
    SIDEBAR_BGS_FALLBACK[themeId];

  const base = `
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #cv-content > * { min-height: 297mm; }
    .cv-entry { break-inside: avoid; page-break-inside: avoid; }
    .cv-section-title { break-after: avoid; page-break-after: avoid; }
  `;

  if (sidebarWidth) {
    return `
      @page {
        size: A4 portrait;
        margin: 0 0 0 ${sidebarWidth};
        @left-top {
          content: element(cv-sidebar-bg);
          height: 297mm;
        }
      }
      @page :first {
        @left-top {
          content: element(cv-sidebar);
          height: 297mm;
        }
      }
      .cv-running-sidebar {
        position: running(cv-sidebar);
        width: ${sidebarWidth};
        min-height: 297mm;
      }
      .cv-sidebar-bg {
        position: running(cv-sidebar-bg);
        width: ${sidebarWidth};
        min-height: 297mm;
        background-color: ${sidebarBg};
      }
      #cv-content {
        width: calc(210mm - ${sidebarWidth}) !important;
        max-width: calc(210mm - ${sidebarWidth}) !important;
      }
      ${base}
    `;
  }

  return `
    @page {
      size: A4 portrait;
      margin: 0;
    }
    ${base}
  `;
}

function PdfRenderContent() {
  const searchParams = useSearchParams();
  const themeId = searchParams.get("theme") || "modern";
  const colorTheme = searchParams.get("colorTheme") || "default";
  const [resume, setResume] = useState<Resume | null>(null);
  const pdfDone = useRef(false);

  useEffect(() => {
    const handler = () => {
      const data = (window as unknown as Record<string, { resume: Resume }>).__RESUME_DATA__;
      if (data?.resume) setResume(data.resume);
    };
    window.addEventListener("resume-data-ready", handler);
    handler();
    return () => window.removeEventListener("resume-data-ready", handler);
  }, []);

  useEffect(() => {
    if (!resume || pdfDone.current) return;

    let cancelled = false;

    const run = async () => {
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      if (cancelled) return;
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      if (cancelled) return;

      // Body reset stays active throughout — pagedjs must not remove it
      const bodyResetEl = document.createElement("style");
      bodyResetEl.setAttribute("data-pagedjs-ignore", "true");
      bodyResetEl.textContent = buildBodyResetCss();
      document.head.appendChild(bodyResetEl);

      // Paged media CSS — pagedjs will collect, process, and apply this
      const pagedEl = document.createElement("style");
      pagedEl.textContent = buildPagedCss(themeId, colorTheme);
      document.head.appendChild(pagedEl);

      const bodyContent = document.body.innerHTML;
      document.body.innerHTML = "";

      const { Previewer } = await import("pagedjs");
      if (cancelled) return;

      pdfDone.current = true;
      const previewer = new Previewer();
      // null triggers removeStyles() so pagedjs collects our injected CSS
      await previewer.preview(bodyContent, null, document.body);

      // Propagate the theme's background color to all pagedjs pages so the
      // empty area at the bottom of the last page doesn't show as white.
      const themeRoot = document.querySelector("#cv-content > *") as HTMLElement | null;
      if (themeRoot) {
        const bg = window.getComputedStyle(themeRoot).backgroundColor;
        const isTransparent = !bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent";
        if (!isTransparent) {
          const bgStyle = document.createElement("style");
          bgStyle.setAttribute("data-pagedjs-ignore", "true");
          bgStyle.textContent = `.pagedjs_page { background-color: ${bg} !important; }`;
          document.head.appendChild(bgStyle);
        }
      }

      await document.fonts.ready;
      (window as unknown as Record<string, unknown>).__PDF_READY__ = true;
      window.dispatchEvent(new CustomEvent("pdf-render-ready"));
    };

    run().catch(console.error);

    return () => { cancelled = true; };
  }, [resume, themeId, colorTheme]);

  return (
    <div id="cv-content" style={{ width: "210mm", backgroundColor: "white" }}>
      <PdfModeProvider value={true}>
        {resume ? (
          <ThemeRenderer resume={resume} themeId={themeId as ThemeId} colorThemeId={colorTheme} />
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            Loading resume data...
          </div>
        )}
      </PdfModeProvider>
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
