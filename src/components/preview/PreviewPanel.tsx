"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { themes, themeIds, type ThemeId } from "@/themes";
import type { Resume } from "@/lib/schemas/resume";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  resume: Resume;
  themeId: ThemeId | string;
  onThemeChange?: (themeId: ThemeId) => void;
  resumeId?: string;
}

const themeAccentDots: Record<string, string> = {
  classic: "bg-slate-700",
  modern: "bg-blue-500",
  minimal: "bg-neutral-900 dark:bg-neutral-100",
  creative: "bg-purple-500",
  compact: "bg-red-700",
  executive: "bg-amber-600",
  aurora: "bg-indigo-500",
  swiss: "bg-red-600",
  neo: "bg-green-400",
  elegant: "bg-rose-400",
  bold: "bg-yellow-400",
};

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
      <div className="border-b px-3 py-2 bg-card space-y-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {themeIds.map((id) => (
            <button
              key={id}
              onClick={() => onThemeChange?.(id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                id === themeId
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {id === themeId && (
                <motion.span
                  layoutId="activeThemePill"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 w-2 h-2 rounded-full shrink-0",
                  themeAccentDots[id] ?? "bg-primary"
                )}
              />
              <span className="relative z-10">{themes[id].name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors"
            title="Zoom arriere"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence mode="wait">
            <motion.span
              key={zoom}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-xs font-mono text-muted-foreground w-10 text-center"
            >
              {zoom}%
            </motion.span>
          </AnimatePresence>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors"
            title="Zoom avant"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors"
            title={isFullscreen ? "Quitter le plein ecran" : "Plein ecran"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isFullscreen ? "min" : "max"}
                initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 20, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
          </button>
          <Button
            size="sm"
            onClick={handleExportPdf}
            className="ml-1 h-7 px-3 text-xs"
          >
            <Download className="w-3 h-3" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/60 p-6">
        <div
          className="mx-auto bg-white shadow-xl origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            width: "210mm",
            minHeight: "297mm",
            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <ThemeRenderer resume={resume} themeId={themeId} />
        </div>
      </div>
    </div>
  );
}
