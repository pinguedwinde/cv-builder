"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { themes, themeIds, type ThemeId, getModelPalettes } from "@/themes";
import type { Resume } from "@/lib/schemas/resume";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  resume: Resume;
  themeId: ThemeId | string;
  onThemeChange?: (themeId: ThemeId) => void;
  colorThemeId?: string;
  onColorThemeChange?: (id: string) => void;
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

type PdfState = "idle" | "loading" | "done";

export function PreviewPanel({ resume, themeId, onThemeChange, colorThemeId = "default", onColorThemeChange, resumeId }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfState, setPdfState] = useState<PdfState>("idle");
  const palettes = getModelPalettes(themeId);

  const handleExportPdf = async () => {
    if (!resumeId || pdfState !== "idle") return;
    setPdfState("loading");
    try {
      const res = await fetch(`/api/export/pdf?id=${resumeId}&theme=${themeId}&colorTheme=${colorThemeId}`);
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.basics?.name || "cv"}-${themeId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 2500);
    } catch (err) {
      console.error("PDF export error:", err);
      setPdfState("idle");
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <div className="border-b px-3 py-2 bg-card space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Thème</p>
              <div className="flex flex-wrap gap-1">
                {themeIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => onThemeChange?.(id)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
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
            </div>

            {palettes.length > 1 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Couleur</p>
                <div className="flex flex-wrap gap-1">
                  {palettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => onColorThemeChange?.(palette.id)}
                      title={palette.name}
                      className={cn(
                        "relative flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                        palette.id === colorThemeId
                          ? "ring-2 ring-offset-1 ring-primary/60 bg-accent"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: palette.swatch }}
                      />
                      <span className="text-xs">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t pt-1.5">
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
            disabled={pdfState !== "idle"}
            className="ml-1 h-7 px-3 text-xs min-w-[64px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {pdfState === "idle" && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </motion.span>
              )}
              {pdfState === "loading" && (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  PDF
                </motion.span>
              )}
              {pdfState === "done" && (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  OK
                </motion.span>
              )}
            </AnimatePresence>
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
          <ThemeRenderer resume={resume} themeId={themeId} colorThemeId={colorThemeId} />
        </div>
      </div>
    </div>
  );
}
