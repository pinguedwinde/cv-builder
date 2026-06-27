"use client";

import { useState } from "react";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { themes, themeIds, type ThemeId } from "@/themes";
import type { Resume } from "@/lib/schemas/resume";
import { ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";

interface PreviewPanelProps {
  resume: Resume;
  themeId: ThemeId | string;
  onThemeChange?: (themeId: ThemeId) => void;
  resumeId?: string;
}

export function PreviewPanel({ resume, themeId, onThemeChange, resumeId }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleExportPdf = async () => {
    if (!resumeId) return;
    try {
      const res = await fetch(`/api/export/pdf?id=${resumeId}&theme=${themeId}`);
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.basics?.name || "cv"}-${themeId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <div className="flex items-center justify-between border-b px-4 py-2 bg-card">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Thème:</label>
          <select
            value={themeId}
            onChange={(e) => onThemeChange?.(e.target.value as ThemeId)}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            {themeIds.map((id) => (
              <option key={id} value={id}>
                {themes[id].name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground"
            title="Plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportPdf}
            className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded hover:opacity-90"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted p-4">
        <div
          className="mx-auto bg-card shadow-lg origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            width: "210mm",
            minHeight: "297mm",
          }}
        >
          <ThemeRenderer resume={resume} themeId={themeId} />
        </div>
      </div>
    </div>
  );
}
